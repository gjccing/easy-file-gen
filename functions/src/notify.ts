import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { addRecord, updateRecord } from "./db";
import { ErrorConstructor } from "./utils";

// import { WebhookType } from "~/global.d";

const db = admin.firestore();

async function triggerWebhook(
  type: Model.Webhook["type"],
  refRecord: Model.Record<Model.GeneratingFinishedContent | Model.Error>
) {
  const settingsSnapshot = await db
    .collection("settings")
    .doc(refRecord.refUserId)
    .get();
  (settingsSnapshot.get("webhooks") as Array<Model.Webhook>)
    .filter((webhook) => webhook.type === type)
    .map(async (webhook) => {
      const record = await addRecord(db)({
        sessionId: refRecord.sessionId,
        refUserId: refRecord.refUserId,
        templateId: refRecord.templateId,
        action: "notify",
      });
      try {
        let error;
        for (let retry = webhook.retryLimit; retry > 0; retry--) {
          await fetch(webhook.url, {
            method: "POST",
            body: JSON.stringify(refRecord.content),
          }).catch((e) => (error = e));
        }
        if (error) throw error;
        updateRecord(db)(record.id, "finished", {
          url: webhook.url,
          reason: "finished",
          content: refRecord.content,
        });
      } catch (e) {
        logger.error("WebhookError", e);
        updateRecord(db)(
          record.id,
          "error",
          ErrorConstructor["502"](e as Error, webhook.url)
        );
      }
    });
}

export const notifyFinished = onDocumentUpdated(
  "/records/{documentId}",
  async (event) => {
    try {
      if (event.data) {
        const data =
          event.data.after.data() as Model.Record<Model.GeneratingFinishedContent>;
        const previousData =
          event.data.before.data() as Model.Record<Model.GeneratingFinishedContent>;
        if (
          data.action === "generate" &&
          previousData.state === "processing" &&
          data.state === "finished"
        ) {
          await triggerWebhook("FINISHED", data);
        }
      }
    } catch (e) {
      logger.error("InternalServerError", e);
    }
  }
);

export const notifyError = onDocumentUpdated(
  "/records/{documentId}",
  async (event) => {
    try {
      if (event.data) {
        const data = event.data.after.data() as Model.Record<Model.Error>;
        const previousData =
          event.data.before.data() as Model.Record<Model.Error>;
        if (
          (data.action === "generate" || data.action === "call") &&
          previousData.state === "processing" &&
          data.state === "error"
        ) {
          await triggerWebhook("ERROR", data);
        }
      }
    } catch (e) {
      logger.error("InternalServerError", e);
    }
  }
);
