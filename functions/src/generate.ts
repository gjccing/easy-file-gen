import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { PubSub } from "@google-cloud/pubsub";
import { ErrorConstructor, getTopicByEngine } from "./utils";
import { addRecord, updateRecord } from "./db";
import { onMessagePublished } from "firebase-functions/v2/pubsub";

const db = admin.firestore();
const pubsub = new PubSub();

export const generate = onDocumentUpdated(
  "/records/{documentId}",
  async (event) => {
    try {
      if (event.data) {
        const data =
          event.data.after.data() as Model.Record<Model.CallingFinishedContent>;
        const previousData =
          event.data.before.data() as Model.Record<Model.CallingFinishedContent>;
        if (
          data.action === "call" &&
          previousData.state === "processing" &&
          data.state === "finished"
        ) {
          const record = await addRecord(db)({
            sessionId: data.sessionId,
            refUserId: data.refUserId,
            templateId: data.templateId,
            action: "generate",
          });
          try {
            const topic = getTopicByEngine(data.content.engine);
            if (topic) {
              pubsub.topic(topic).publishMessage({
                data: Buffer.from(JSON.stringify({ ...data, id: record.id })),
              });
            }
          } catch (e) {
            logger.error("InternalServerError", e);
            await updateRecord(db)(
              record.id,
              "error",
              ErrorConstructor["-1"](e)
            );
          }
        }
      }
    } catch (e) {
      logger.error("InternalServerError", e);
    }
  }
);

export const handleTopicGeneratingResult = onMessagePublished(
  "generating-result-topic",
  async (event) => {
    const data = JSON.parse(
      Buffer.from(event.data.message.data, "base64").toString()
    );
    if (data.recordId) {
      try {
        if (data.state === "error") {
          await updateRecord(db)(
            data.recordId,
            data.state,
            ErrorConstructor[data.code as "-1"](data.error)
          );
        } else await updateRecord(db)(data.recordId, data.state, data.result);
      } catch (e) {
        logger.error("InternalServerError", e);
        await updateRecord(db)(
          data.recordId,
          "error",
          ErrorConstructor["-1"](e)
        );
      }
    }
  }
);
