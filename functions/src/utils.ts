import { Timestamp } from "firebase-admin/firestore";
import { RequestHandler } from "express";
import type { SupportedEngine } from "../../src/global";

export const getTopicByEngine = (engine: SupportedEngine) => {
  switch (engine) {
    case "@react-pdf/renderer@3.4.4":
      return "sandbox-nodejs18-pubsub";
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
  taskId: string
): Model.DataMissingError => ({
  taskId,
  createdAt: Timestamp.now() as Model.DataMissingError["createdAt"],
  name: "DataMissingError",
  message: "Required data is missing.",
  missingTarget: "PreparationEndedEvent",
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
  error: string = ""
): Model.TemplateExecutionError => ({
  taskId,
  createdAt: Timestamp.now() as Model.TemplateExecutionError["createdAt"],
  name: "TemplateExecutionError",
  message: "Error occurred while executing the template.",
  error,
});

export const getOutputStorageRef = (refEvent: Model.PreparationEndedEvent) => {
  let filename = refEvent.filename ?? `${firestoreAutoId()}.pdf`;
  if (!filename.endsWith(".pdf")) filename = `${filename}.pdf`;
  return `output/${refEvent.userId}/${refEvent.taskId}/${filename}`;
};

export const createGenerationMessage = (
  refEvent: Model.PreparationEndedEvent
) => {
  return {
    taskId: refEvent.taskId,
    inputStorageRef: refEvent.inputStorageRef,
    templateStorageRef: refEvent.templateStorageRef,
    engine: refEvent.engine,
    outputStorageRef: getOutputStorageRef(refEvent),
  };
};

export const createGenerationEndedEvent = (
  message: Model.Message
): Model.GenerationEndedEvent => {
  return {
    taskId: message.refTaskId,
    createdAt: Timestamp.now() as Model.GenerationEndedEvent["createdAt"],
    name: "GenerationEndedEvent",
    outputStorageRef: message.outputStorageRef ?? "",
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

export const createDataSyntaxError = (
  taskId: string
): Model.DataSyntaxError => ({
  taskId,
  createdAt: Timestamp.now() as Model.DataSyntaxError["createdAt"],
  name: "DataSyntaxError",
  message:
    "Syntax error in uploading data. The data does not conform to JSON format.",
});

export const createTemplateLoadingError = (
  taskId: string,
  error: string = ""
): Model.TemplateLoadingError => ({
  taskId,
  createdAt: Timestamp.now() as Model.TemplateLoadingError["createdAt"],
  name: "TemplateLoadingError",
  message: "Error occurred while loading the template.",
  error,
});

export const convertMessageToEvent = (message: Model.Message) => {
  if (message.type === "DataSyntaxError") {
    return createDataSyntaxError(message.refTaskId);
  } else if (message.type === "TemplateLoadingError") {
    return createTemplateLoadingError(
      message.refTaskId,
      message.stack ?? message.message
    );
  } else if (message.type === "GenerationEndedEvent") {
    return createGenerationEndedEvent(message);
  } else if (message.type === "TemplateExecutionError") {
    return createTemplateExecutionError(
      message.refTaskId,
      message.stack ?? message.message
    );
  } else {
    return createInternalServerError(message.refTaskId);
  }
};
