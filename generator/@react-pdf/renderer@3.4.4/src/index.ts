import { onMessagePublished } from "firebase-functions/v2/pubsub";
import * as logger from "firebase-functions/logger";
import { PubSub } from "@google-cloud/pubsub";
import * as admin from "firebase-admin";
import { LRUCache } from "lru-cache";
import vm, { Context } from "vm";
import * as react from "react";
import * as renderer from "@react-pdf/renderer";
import * as lodash from "lodash";

if (admin.apps.length === 0) admin.initializeApp();

const bucket = admin.storage().bucket();
const pubsub = new PubSub();

const moduleCache = new LRUCache<string, string>({
  max: 500,
  maxSize: 5000,
  sizeCalculation: () => 1,
  ttl: 1000 * 60 * 5,
  allowStale: false,
  updateAgeOnGet: true,
  updateAgeOnHas: false,
});

const sandbox = {
  exports: {},
  require: (moduleName: string) => {
    if (moduleName === "react") return react;
    if (moduleName === "@react-pdf/renderer") return renderer;
    if (moduleName === "lodash") return lodash;
    throw new Error(`Module not found: ${moduleName}`);
  },
};

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

export const react_pdf_renderer_3_4_4 = onMessagePublished(
  "react_pdf_renderer_3_4_4",
  async (event) => {
    const record = JSON.parse(
      Buffer.from(event.data.message.data, "base64").toString()
    ) as Model.Record<Model.CallingFinishedContent>;
    try {
      const content = record.content;
      const [data, code] = await Promise.all([
        fetchData(content.dataStorageRef),
        fetchTemplateCode(content.templateStorageRef),
      ]);

      const newModule: Context = { ...sandbox };
      vm.createContext(newModule);
      let result;
      try {
        vm.runInContext(code, newModule);
        result = newModule.exports.default(data);
      } catch (error: any) {
        error =
          error.stack?.replaceAll(
            "node:vm",
            content.templateStorageRef.replace(/.*\//, "")
          ) ?? error.toString();
        pubsub.topic("generating-result-topic").publishMessage({
          data: Buffer.from(
            JSON.stringify({
              state: "error",
              recordId: record.id,
              code: 500,
              error,
            })
          ),
        });
        return;
      }

      const stream = await renderer.renderToStream(result);
      const outputWS = bucket
        .file(content.outputStorageRef)
        .createWriteStream();
      await new Promise((res, rej) =>
        stream.pipe(outputWS).on("finish", res).on("error", rej)
      );
      pubsub.topic("generating-result-topic").publishMessage({
        data: Buffer.from(
          JSON.stringify({
            state: "finished",
            recordId: record.id,
            result: {
              filename: content.filename,
              publicOutputFileUrl: bucket
                .file(content.outputStorageRef)
                .publicUrl(),
              isDeleted: false,
            },
          })
        ),
      });
    } catch (error: any) {
      logger.error("InternalServerError", error);
      pubsub.topic("generating-result-topic").publishMessage({
        data: Buffer.from(
          JSON.stringify({
            state: "error",
            recordId: record.id,
            code: -1,
            error: error.stack ?? error.toString(),
          })
        ),
      });
    }
  }
);
