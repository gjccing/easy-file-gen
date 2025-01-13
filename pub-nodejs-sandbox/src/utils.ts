import { Timestamp } from "firebase-admin/firestore";

export const firestoreAutoId = (): string => {
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let autoId = "";

  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return autoId;
};

export const createDataMissingError = (
  taskId: string,
  missingTarget: Model.DataMissingError["missingTarget"]
): Model.DataMissingError => ({
  taskId,
  createdAt: Timestamp.now() as Model.GenerationEndedEvent["createdAt"],
  name: "DataMissingError",
  message: "Required data is missing.",
  missingTarget,
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
