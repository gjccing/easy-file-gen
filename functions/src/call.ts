import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import type { Request } from "firebase-functions/lib/common/providers/https";
import { verify } from "jsonwebtoken";
import * as admin from "firebase-admin";
import * as Busboy from "busboy";
import { v4 as uuidv4 } from "uuid";
import {
  ErrorConstructor,
  ErrorMessage,
  getContentTypeByOutputType,
} from "./utils";
import { addRecord, updateRecord } from "./db";
import { Readable, PassThrough } from "stream";
import { parser } from "stream-json";
import { getDownloadURL } from "firebase-admin/storage";

const db = admin.firestore();
const bucket = admin.storage().bucket();

const verifyAPITokenAndIdentifyUser = async (
  token?: string
): Promise<string | undefined> => {
  try {
    if (token) {
      const payload: { userId: string; expiresAt?: number } = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      if (payload.expiresAt && payload.expiresAt >= Date.now()) return;
      const doc = await db.collection("settings").doc(payload.userId).get();
      if (!doc.exists) return;
      verify(token.slice(7), doc.get("apiToken.token"));
      return payload.userId;
    }
  } catch (e) {
    logger.warn("User authentication failed", e);
  }
  return;
};

const verifyPathAndFetchTemplate = async (
  path: string,
  userId: string
): Promise<[Model.Template, string] | undefined> => {
  try {
    let [, templateId, filename] = path.split("/");
    const doc = await db.collection("templates").doc(templateId).get();
    if (!doc.exists) return;
    if (doc.get("authorId") !== userId) return;
    const template = doc.data() as Model.Template;
    const extFilename = `.${template.outputType.toLocaleLowerCase()}`;
    return [
      template,
      filename + (filename.endsWith(extFilename) ? "" : extFilename),
    ];
  } catch (e) {
    logger.warn("Template does not exist", e);
  }
  return;
};

async function uploadFile(req: Request, destination: string) {
  const [, file, info] = await new Promise<[string, Readable, Busboy.FileInfo]>(
    (res, rej) =>
      Busboy({ headers: req.headers })
        .on("file", (name, file, info) => res([name, file, info]))
        .on("error", rej)
        .end(req.rawBody)
  );
  if (info.mimeType !== "application/json") {
    throw new Error("Unsupported the uploaded data format");
  }

  const checkFormat = new PassThrough().pipe(parser());
  const writeToStorage = new PassThrough().pipe(
    bucket
      .file(destination)
      .createWriteStream({ contentType: "application/json" })
  );
  const [formatError, writingError] = await Promise.all([
    new Promise((res) =>
      file.pipe(checkFormat).on("finish", res).on("error", res)
    ),
    new Promise((res) =>
      file.pipe(writeToStorage).on("finish", res).on("error", res)
    ),
  ]);
  if (writingError) throw writingError;
  if (formatError) throw new Error("Unsupported the uploaded data format");
}

export const call = onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).end();
    return;
  }

  const userId = await verifyAPITokenAndIdentifyUser(
    request.header("Authorization")
  );
  if (userId === undefined) {
    response.status(401).end();
    return;
  }

  const templateInfo = await verifyPathAndFetchTemplate(request.path, userId);
  if (!templateInfo) {
    response.status(404).end();
    return;
  }
  const [template, filename] = templateInfo;
  const sessionId = uuidv4();
  const record = await addRecord(db)({
    sessionId: sessionId,
    refUserId: userId,
    templateId: template.id,
    action: "call",
  });
  try {
    if (!template.enabled) throw new Error("Template is disabled");
    const contentType = request.header("Content-Type");
    const datadataStorageRef = `data/${userId}/${template.id}/${sessionId}.json`;
    if (contentType === "application/json") {
      await bucket.file(datadataStorageRef).save(request.rawBody, {
        contentType: "application/json",
      });
    } else if (contentType?.startsWith("multipart/form-data")) {
      await uploadFile(request, datadataStorageRef);
    } else {
      throw new Error("Unsupported the uploaded data format");
    }

    const outputStorageRef = `output/${userId}/${template.id}/${sessionId}/${filename}`;
    const file = bucket.file(outputStorageRef);
    await file.save("", {
      contentType: getContentTypeByOutputType(template.outputType) ?? "",
    });

    await updateRecord(db)(record.id, "finished", {
      callingUrl: request.path,
      filename: filename,
      engine: template.engine,
      dataStorageRef: datadataStorageRef,
      templateStorageRef:
        template.compiledContentStorageRef ?? template.contentStorageRef,
      outputStorageRef,
    });
    response.send({
      sessionId,
      outputFileURL: await getDownloadURL(file),
      state: "processing",
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Template is disabled") {
      await updateRecord(db)(record.id, "error", ErrorConstructor["403"](e));
      response.status(403).send({ sessionId, error: ErrorMessage["403"] });
    } else if (
      e instanceof SyntaxError ||
      (e instanceof Error &&
        e.message === "Unsupported the uploaded data format")
    ) {
      await updateRecord(db)(record.id, "error", ErrorConstructor["400"](e));
      response.status(400).send({ sessionId, error: ErrorMessage["400"] });
    } else {
      logger.error("InternalServerError", e);
      await updateRecord(db)(record.id, "error", ErrorConstructor["-1"](e));
      response.status(500).send({ sessionId, error: ErrorMessage["500"] });
    }
  }
  response.end();
});

export const state = onRequest(async (request, response) => {
  if (request.method !== "GET") {
    response.status(405).end();
    return;
  }

  const userId = await verifyAPITokenAndIdentifyUser(
    request.header("Authorization")
  );
  if (userId === undefined) {
    response.status(401).end();
    return;
  }

  try {
    const [, sessionId] = request.path.split("/");
    const recordsSnapshot = await db
      .collection("records")
      .where("sessionId", "==", sessionId)
      .where("refUserId", "==", userId)
      .orderBy("createdAt")
      .get();
    const records = recordsSnapshot.docs.map(
      (doc) => doc.data() as unknown as Model.Record<any>
    );
    const callingRecord:
      | Model.Record<Model.CallingFinishedContent>
      | undefined = records.find((rec) => rec.action === "call");
    if (!callingRecord) {
      response.status(404).send({ state: "not-found", records: [] });
    } else {
      const generatingRecord:
        | Model.Record<Model.GeneratingFinishedContent>
        | undefined = records.find((rec) => rec.action === "generate");
      response
        .send({
          state:
            generatingRecord?.state !== "processing"
              ? "finished"
              : "processing",
          fileIsReady: generatingRecord?.state === "finished",
          hasError: records.some((rec) => rec.state === "error"),
          outputFileURL:
            callingRecord.state !== "error"
              ? await getDownloadURL(
                  bucket.file(callingRecord.content.outputStorageRef)
                )
              : "",
          records,
        })
        .end();
    }
  } catch (e) {
    logger.error("InternalServerError", e);
    response.status(500).send({}).end();
  }
});
