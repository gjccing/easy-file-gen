import { Timestamp } from "firebase-admin/firestore";
import { RequestHandler } from "express";
import type { SupportedEngine } from "../../src/global";

export const getTopicByEngine = (engine: SupportedEngine) => {
  switch (engine) {
    case "@react-pdf/renderer@3.4.4":
      return "nodejs-sandbox-pub";
  }
  return "";
};

export const asyncErrorCatcher =
  (cb: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (e) {
      next(e);
    }
  };

export function firestoreAutoId(): string {
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let autoId = "";

  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return autoId;
}

export const createPreparationEndedEvent = (
  userId: string,
  taskId: string,
  filename: string,
  template: Model.Template
): Model.PreparationEndedEvent => ({
  taskId,
  createdAt: Timestamp.now() as Model.PreparationEndedEvent["createdAt"],
  name: "PreparationEndedEvent",
  userId,
  filename: filename,
  inputStorageRef: `input/${userId}/${taskId}.json`,
  engine: template.engine,
  templateStorageRef:
    template.compiledContentStorageRef ?? template.contentStorageRef,
});

export const createDataMissingError = (
  taskId: string,
  missingTarget: Model.DataMissingError["missingTarget"]
): Model.DataMissingError => ({
  taskId,
  createdAt: Timestamp.now() as Model.DataMissingError["createdAt"],
  name: "DataMissingError",
  message: "Required data is missing.",
  missingTarget,
});

export const createSendRendererEndedEvent = (
  taskId: string,
  messageId: string
): Model.SendRendererEndedEvent => ({
  taskId,
  createdAt: Timestamp.now() as Model.DataMissingError["createdAt"],
  name: "SendRendererEndedEvent",
  messageId,
});

export const createTemplateExecutionError = (
  taskId: string,
  error: string
): Model.TemplateExecutionError => ({
  taskId,
  createdAt: Timestamp.now() as Model.TemplateExecutionError["createdAt"],
  name: "TemplateExecutionError",
  message: "Error occurred while executing the template.",
  error,
});

export const createGenerationEndedEvent = (
  refEvent: Model.PreparationEndedEvent
): Model.GenerationEndedEvent => {
  let filename = refEvent.filename ?? `${firestoreAutoId()}.pdf`;
  if (!filename.endsWith(".pdf")) filename = `${filename}.pdf`;
  const outputStorageRef = `output/${refEvent.userId}/${refEvent.taskId}/${filename}`;
  return {
    taskId: refEvent.taskId,
    createdAt: Timestamp.now() as Model.GenerationEndedEvent["createdAt"],
    name: "GenerationEndedEvent",
    outputStorageRef,
    isDeleted: false,
  };
};

export const createWebhookEndedEvent = async (
  taskId: string,
  webhook: Model.Webhook,
  resp: Response
): Promise<Model.WebhookEndedEvent> => {
  return {
    taskId,
    createdAt: Timestamp.now() as Model.WebhookEndedEvent["createdAt"],
    name: "WebhookEndedEvent",
    type: webhook.type,
    url: webhook.url,
    response: {
      status: `${resp.status} ${resp.statusText}`,
      headers: [...resp.headers].map(([k, v]) => `${k}: ${v}`).join("\n"),
      body: await resp.text(),
    },
  };
};

export const createInternalServerError = (
  taskId: string
): Model.InternalServerError => ({
  taskId,
  createdAt: Timestamp.now() as Model.InternalServerError["createdAt"],
  name: "InternalServerError",
  message:
    "An unexpected issue occurred on our server. Please contact us for fixing the problem. We apologize for the inconvenience.",
});

export const createExecutionTimeoutError = (
  taskId: string
): Model.ExecutionTimeoutError => ({
  taskId,
  createdAt: Timestamp.now() as Model.ExecutionTimeoutError["createdAt"],
  name: "ExecutionTimeoutError",
  message:
    "The execution of this task has timed out, please check your template and uploaded data or retry.",
});
