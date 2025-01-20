/// <reference types="@solidjs/start/env" />

import { Timestamp } from "firebase/firestore";

import type * as monaco from "monaco-editor";

export enum OutputType {
  PDF = "PDF",
  //   DOCX = "DOCX",
  //   EPUB = "EPUB",
  //   TXT = "TXT",
  //   RTF = "RTF",
}

export enum SupportedEngine {
  "@react-pdf/renderer@3.4.4" = "@react-pdf/renderer@3.4.4",
}

export enum WebhookType {
  FINISHED = "FINISHED",
  ERROR = "ERROR",
}

declare global {
  interface EDITOR_PRESET {
    createEditorConstructionOptions?: (
      initialModel?: monaco.editor.ITextModel
    ) =>
      | monaco.editor.IStandaloneEditorConstructionOptions
      | Promise<monaco.editor.IStandaloneEditorConstructionOptions>;
    onAfterCreatedEditor?: (
      editor: monaco.editor.IStandaloneCodeEditor
    ) => void;
    onAfterDisposedEditor?: (
      editor: monaco.editor.IStandaloneCodeEditor
    ) => void;
    preprocessBeforeChange?: (value: File) => Promise<File>;
  }

  namespace Model {
    // Webhook interface
    interface Webhook {
      type: "FINISHED" | "ERROR";
      url: string;
      retryLimit: number;
    }

    // Access Control Management:
    interface Settings {
      apiToken: {
        token: string; // prevent users' template from being misused by others.
        expiresAt?: Timestamp;
      };
      accessControlAllowOrigin: string[]; // prevent users' templates from being misused by other sites. the default is *
      webhooks: Webhook[]; // users can set webhooks to get notified when their file is done, I will send notifications according to these settings.
    }

    // Template interface: Preset templates for file generation.
    interface Template {
      id: string;
      authorId: string;
      createdAt: Timestamp;
      editedAt: Timestamp;
      callingCount: number;
      errorCount: number;

      enabled: boolean;
      outputType: OutputType;
      name: string;
      description: string;
      engine: SupportedEngine;
      contentStorageRef: string; // <= 10kb
      compiledContentStorageRef?: string;
      isDeleted: boolean;
    }

    interface Task {
      id: string;
      createdAt: Timestamp;
      editedAt: Timestamp;
      userId: string;
      templateId: string;
      state: "PREPARING" | "GENERATING" | "FINISHED" | "ERROR";
      downloadURL?: string;
      events: Event[];
    }

    type Event =
      | PreparationEndedEvent
      | DataMissingError
      | SendRendererEndedEvent
      | DataSyntaxError
      | TemplateLoadingError
      | TemplateExecutionError
      | GenerationEndedEvent
      | WebhookEndedEvent
      | InternalServerError
      | ExecutionTimeoutError;

    interface PreparationEndedEvent {
      taskId: string;
      createdAt: Timestamp;
      name: "PreparationEndedEvent";
      userId: string;
      filename?: string;
      inputStorageRef: string;
      engine: SupportedEngine;
      templateStorageRef: string;
    }

    interface DataMissingError {
      taskId: string;
      createdAt: Timestamp;
      name: "DataMissingError";
      message: "Required data is missing.";
      missingTarget: "PreparationEndedEvent";
    }

    interface SendRendererEndedEvent {
      taskId: string;
      createdAt: Timestamp;
      name: "SendRendererEndedEvent";
      messageId: string;
    }

    interface DataSyntaxError {
      taskId: string;
      createdAt: Timestamp;
      name: "DataSyntaxError";
      message: "Syntax error in uploading data. The data does not conform to JSON format.";
    }

    interface TemplateLoadingError {
      taskId: string;
      createdAt: Timestamp;
      name: "TemplateLoadingError";
      message: "Error occurred while loading the template.";
      error: string;
    }

    interface TemplateExecutionError {
      taskId: string;
      createdAt: Timestamp;
      name: "TemplateExecutionError";
      message: "Error occurred while executing the template.";
      error: string;
    }

    interface GenerationEndedEvent {
      taskId: string;
      createdAt: Timestamp;
      name: "GenerationEndedEvent";
      outputStorageRef: string;
      isDeleted: boolean;
    }

    interface WebhookEndedEvent {
      taskId: string;
      createdAt: Timestamp;
      name: "WebhookEndedEvent";
      type: "FINISHED" | "ERROR";
      url: string;
      response: {
        status: string;
        headers: string;
        body: string;
      };
    }

    interface InternalServerError {
      taskId: string;
      createdAt: Timestamp;
      name: "InternalServerError";
      message: "An unexpected issue occurred on our server. Please contact us for fixing the problem. We apologize for the inconvenience.";
    }

    interface ExecutionTimeoutError {
      taskId: string;
      createdAt: Timestamp;
      name: "ExecutionTimeoutError";
      message: "The execution of this task has timed out, please check your template and uploaded data or retry.";
    }

    interface Message {
      source: "sandbox-nodejs18";
      refTaskId: string;
      type:
        | "DataSyntaxError"
        | "InternalServerError"
        | "TemplateLoadingError"
        | "GenerationEndedEvent"
        | "TemplateExecutionError";
      outputStorageRef?: string;
      message?: string;
      stack?: string;
    }
  }
}
