import { onRequest } from "firebase-functions/v1/https";
import * as logger from "firebase-functions/logger";

import * as admin from "firebase-admin";
import Busboy from "busboy";
import { v4 as uuidv4 } from "uuid";
import {
  ErrorConstructor,
  ErrorMessage,
  getContentTypeByOutputType,
  middlewareWrapper,
} from "../utils";
import { addRecord, updateRecord } from "../db";
import { Readable, PassThrough } from "stream";
import { parser } from "stream-json";
import { getDownloadURL } from "firebase-admin/storage";

import express, { ErrorRequestHandler } from "express";
import helmet from "helmet";
import authorization from "./middlewares/authorization";
import cors from "./middlewares/cors";

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function responseError(
  req: express.Request,
  res: express.Response,
  code: keyof typeof ErrorConstructor,
  err: any
) {
  req.recordId &&
    (await updateRecord(db)(
      req.recordId,
      "error",
      ErrorConstructor[code](err, "")
    ));
  res
    .status(code === "-1" ? 500 : Number(code))
    .send({ sessionId: req.sessionId, error: ErrorMessage[code] });
}
const app = express();

app.use(helmet());
app.use(authorization);
app.use(cors);

app.post(
  "/call/:templateId/:filename",
  middlewareWrapper(async (req, res, next) => {
    const templateId = req.params.templateId;
    const filename = req.params.filename;
    const doc = await db.collection("templates").doc(templateId).get();
    if (!doc.exists || doc.get("authorId") !== req.userId) {
      responseError(req, res, "404", undefined);
    } else {
      req.template = doc.data() as Model.Template;
      const extFilename = `.${req.template.outputType.toLocaleLowerCase()}`;
      req.params.filename =
        filename + (filename.endsWith(extFilename) ? "" : extFilename);
      next();
    }
  }),
  middlewareWrapper(async (req, _, next) => {
    const sessionId = uuidv4();
    const record = await addRecord(db)({
      sessionId,
      refUserId: req.userId,
      templateId: req.params.templateId,
      action: "call",
    });
    req.sessionId = sessionId;
    req.recordId = record.id;
    req.datadataStorageRef = `data/${req.userId}/${req.params.templateId}/${sessionId}.json`;
    req.outputStorageRef = `output/${req.userId}/${req.params.templateId}/${sessionId}/${req.params.filename}`;
    next();
  }),
  middlewareWrapper(async (req, res, next) => {
    if (req.template?.enabled) next();
    else responseError(req, res, "403", undefined);
  }),
  middlewareWrapper(async (req, _, next) => {
    if (req.header("Content-Type") === "application/json") {
      const fileRef = bucket.file(req.datadataStorageRef ?? "");
      await fileRef.save(JSON.stringify(req.body), {
        contentType: "application/json",
      });
      req.done = true;
      next();
    } else next();
  }),
  middlewareWrapper(async (req, res, next) => {
    if (req.header("Content-Type")?.startsWith("multipart/form-data")) {
      const [, file] = await new Promise<[string, Readable, Busboy.FileInfo]>(
        (res, rej) => {
          Busboy({
            headers: req.headers as any,
          })
            .on("file", (name, file, info) => res([name, file, info]))
            .on("error", rej)
            .end(req.rawBody);
        }
      );
      const checkFormat = new PassThrough().pipe(parser());
      const writeToStorage = new PassThrough().pipe(
        bucket
          .file(req.datadataStorageRef ?? "")
          .createWriteStream({ contentType: "application/json" })
      );
      const [formatError] = await Promise.all([
        new Promise((res) =>
          file.pipe(checkFormat).on("finish", res).on("error", res)
        ),
        new Promise((res, rej) =>
          file.pipe(writeToStorage).on("finish", res).on("error", rej)
        ),
      ]);
      if (formatError) {
        responseError(req, res, "400", undefined);
      } else {
        req.done = true;
        next();
      }
    } else next();
  }),
  middlewareWrapper(async (req, res, next) => {
    if (!req.done) return responseError(req, res, "400", undefined);
    else next();
  }),
  middlewareWrapper(async (req, res, _) => {
    const file = bucket.file(req.outputStorageRef ?? "");
    await file.save("", {
      contentType: getContentTypeByOutputType(req.template?.outputType as any),
    });
    await updateRecord(db)(req.recordId ?? "", "finished", {
      callingUrl: req.path,
      filename: req.params.filename,
      engine: req.template?.engine,
      dataStorageRef: req.datadataStorageRef,
      templateStorageRef:
        req.template?.compiledContentStorageRef ??
        req.template?.contentStorageRef,
      outputStorageRef: req.outputStorageRef,
    });
    res.send({
      sessionId: req.sessionId,
      outputFileURL: await getDownloadURL(
        bucket.file(req.outputStorageRef ?? "")
      ),
      state: "processing",
    });
  })
);

app.get(
  "/state/:sessionId",
  middlewareWrapper(async (req, res, next) => {
    const recordsSnapshot = await db
      .collection("records")
      .where("sessionId", "==", req.params.sessionId)
      .where("refUserId", "==", req.userId)
      .orderBy("createdAt")
      .get();
    const records = recordsSnapshot.docs.map(
      (doc) => doc.data() as unknown as Model.Record<any>
    );
    const callingRecord:
      | Model.Record<Model.CallingFinishedContent>
      | undefined = records.find((rec) => rec.action === "call");
    if (!callingRecord) {
      res.status(404).send({ state: "not-found", records: [] });
    } else {
      const generatingRecord:
        | Model.Record<Model.GeneratingFinishedContent>
        | undefined = records.find((rec) => rec.action === "generate");
      res
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
  })
);

app.use((async (err, req, res, next) => {
  logger.error("InternalServerError", err);
  responseError(req, res, "-1", err);
}) as ErrorRequestHandler);

export const api = onRequest(app);
