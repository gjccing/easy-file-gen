import { onMessagePublished } from "firebase-functions/v2/pubsub";
import * as logger from "firebase-functions/logger";
import { PubSub } from "@google-cloud/pubsub";
import * as admin from "firebase-admin";
import { LRUCache } from "lru-cache";
import vm, { Context } from "vm";
import * as react from "react";
import * as react_pdf_renderer_3_4_4 from "react_pdf_renderer_3_4_4";
import * as lodash from "lodash";
import {
  createDataMissingError,
  createTemplateExecutionError,
  createGenerationEndedEvent,
  createDataSyntaxError,
} from "./utils";
import { SupportedEngine } from "../../src/global";

if (admin.apps.length === 0) admin.initializeApp();

const bucket = admin.storage().bucket();
const pubsub = new PubSub();

const moduleCache = new LRUCache<string, string>({
  ttl: 1000 * 60 * 3,
  ttlAutopurge: true,
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

const sandbox = (engine: SupportedEngine) => ({
  exports: {},
  require: (moduleName: string) => {
    if (moduleName === "react") return react;
    if (moduleName === "@react-pdf/renderer") {
      if (engine === "@react-pdf/renderer@3.4.4")
        return react_pdf_renderer_3_4_4;
      else return react_pdf_renderer_3_4_4;
    }
    if (moduleName === "lodash") return lodash;
    throw new Error(`Module not found: ${moduleName}`);
  },
});

const fetchData = async (path: string) => {
  const str = (await bucket.file(path).download()).toString();
  return JSON.parse(str);
};

const fetchTemplateCode = async (path: string): Promise<string> => {
  const templateFile = bucket.file(path);
  const [metadata] = await templateFile.getMetadata();
  const md5Hash = metadata?.md5Hash;
  if (md5Hash) {
    let code = moduleCache.get(md5Hash);
    if (!code) {
      code = (await templateFile.download()).toString();
      moduleCache.set(md5Hash, code);
    }
    return code;
  } else return (await templateFile.download()).toString();
};

function responseResult(data: any) {
  pubsub.topic("generating-end-pub").publishMessage({
    data: Buffer.from(JSON.stringify(data)),
  });
}

export const nodejsSandboxPub = onMessagePublished(
  "nodejs-sandbox-pub",
  async (event) => {
    try {
      const preEvent = JSON.parse(
        Buffer.from(event.data.message.data, "base64").toString()
      ) as Model.PreparationEndedEvent;

      const [dataResult, codeResult] = await Promise.allSettled([
        fetchData(preEvent.inputStorageRef),
        fetchTemplateCode(preEvent.templateStorageRef),
      ]);

      if (dataResult.status !== "fulfilled") {
        if (dataResult.reason instanceof SyntaxError) {
          logger.error("DataSyntaxError", dataResult.reason);
          responseResult(createDataSyntaxError(preEvent.taskId));
        } else {
          logger.error("InternalServerError", event, dataResult.reason);
        }
        return;
      }
      if (codeResult.status !== "fulfilled") {
        logger.error("DataMissingError", codeResult.reason);
        responseResult(
          createDataMissingError(preEvent.taskId, "templateStorageRef")
        );
        return;
      }
      const data = dataResult.value;
      const code = codeResult.value;
      const newModule: Context = { ...sandbox(preEvent.engine) };
      vm.createContext(newModule);
      const result = createGenerationEndedEvent(preEvent);
      const outputWS = bucket
        .file(result.outputStorageRef)
        .createWriteStream({ contentType: "application/pdf" });

      try {
        vm.runInContext(code, newModule);
        await new Promise(async (res, rej) =>
          (await newModule.exports.default(data))
            .pipe(outputWS)
            .on("finish", res)
            .on("error", rej)
        );
        responseResult(result);
      } catch (error: any) {
        responseResult(
          createTemplateExecutionError(
            preEvent.taskId,
            error.stack?.replaceAll(
              "node:vm",
              preEvent.templateStorageRef.replace(/.*\//, "")
            ) ?? error.toString()
          )
        );
      }
    } catch (error: any) {
      logger.error("InternalServerError", event, error);
    }
  }
);
