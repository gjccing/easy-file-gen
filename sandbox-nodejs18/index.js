'use strict';

const vm = require('vm');
const functions = require('@google-cloud/functions-framework')
const {Storage} = require('@google-cloud/storage');
const {PubSub} = require('@google-cloud/pubsub');
const { LRUCache } = require('lru-cache')

const react = require('react');
const lodash = require('lodash');
const react_pdf_renderer_3_4_4 = require('react_pdf_renderer_3_4_4');

const storage = new Storage();
const bucket = storage.bucket('easy-file-gen.appspot.com');
const pubsub = new PubSub();

const moduleCache = new LRUCache({
  ttl: 1000 * 60 * 3,
  ttlAutopurge: true,
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

const sandbox = (engine) => ({
  exports: {},
  require: (moduleName) => {
    if (moduleName === "react") return { default: react };
    if (moduleName === "@react-pdf/renderer") {
      if (engine === "@react-pdf/renderer@3.4.4")
        return react_pdf_renderer_3_4_4;
      else return react_pdf_renderer_3_4_4;
    }
    if (moduleName === "lodash") return { default: lodash };
    throw new Error(`Module not found: ${moduleName}`);
  },
});

const fetchData = async path => {
  const str = (await bucket.file(path).download()).toString();
  return JSON.parse(str);
};

const fetchTemplateCode = async path => {
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

function responseResult(type, refTaskId, info = {}) {
  const data = {
    source: 'sandbox-nodejs18',
    refTaskId,
    type,
    ...info
  }
  pubsub.topic("generation-ended-pubsub").publishMessage({
    data: Buffer.from(JSON.stringify(data)),
  });
}

functions.cloudEvent("sandbox-nodejs18", async cloudEvent => {
  try {
    const info = JSON.parse(
      Buffer.from(cloudEvent.data?.message.data ?? "", "base64").toString()
      )
    const [dataResult, codeResult] = await Promise.allSettled([
      fetchData(info.inputStorageRef),
      fetchTemplateCode(info.templateStorageRef),
    ]);

    if (dataResult.status !== "fulfilled") {
      console.warn(dataResult.reason.stack, dataResult.reason, cloudEvent);
      const type =
        dataResult.reason instanceof SyntaxError
          ? "DataSyntaxError"
          : "InternalServerError";
      responseResult(type, info.taskId, {
        message: dataResult.reason.toString(),
        stack: dataResult.reason.stack,
      });
      return;
    }
    
    if (codeResult.status !== "fulfilled") {
      console.warn(codeResult.reason.stack, codeResult.reason, cloudEvent);
      responseResult("TemplateLoadingError", info.taskId, {
        message: codeResult.reason.toString(),
        stack: codeResult.reason.stack,
      });
      return;
    }

    const data = dataResult.value;
    const code = codeResult.value;
    const newModule = { ...sandbox(info.engine) };
    vm.createContext(newModule);
    const outputWS = bucket
      .file(info.outputStorageRef)
      .createWriteStream({ contentType: "application/pdf" });

    try {
      vm.runInContext(code, newModule);
      await new Promise(async (res, rej) =>
        (await newModule.exports.default(data))
          .pipe(outputWS)
          .on("finish", res)
          .on("error", rej)
      );
      responseResult("GenerationEndedEvent", info.taskId, {
        outputStorageRef: info.outputStorageRef,
      });
    } catch (error) {
      console.warn(error.stack, error, cloudEvent);
      responseResult("TemplateExecutionError", info.taskId, {
        message: error.toString(),
        stack: error.stack?.replaceAll(
          "node:vm",
          info.templateStorageRef.replace(/.*\//, "")
        ),
      });
    }
  } catch (error) {
    console.error(error.stack, error, cloudEvent);
  }
});
