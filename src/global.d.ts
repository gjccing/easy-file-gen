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

    /**
     * GenFileRecords interface
     * This record only records the file generation process.
     * Except for the calling and notifying action, others will be automatically added by firestore events.
     * The calling action will be created when the trigger api is called.
     * The notifying action will be created, only if the user has set webhooks
     * It will be created by the finished and error event listeners.
     */

    interface Record<
      T extends
        | CallingFinishedContent
        | GeneratingFinishedContent
        | NotifingFinishedContent
        | Error
    > {
      id: string;
      sessionId: string;
      createdAt: Timestamp;
      editedAt: Timestamp;
      refUserId: string;
      templateId: string;
      action: "call" | "generate" | "notify";
      state: "processing" | "finished" | "error";
      content: T;
    }

    // Payload interfaces
    interface CallingFinishedContent {
      callingUrl: string; // /template-id/filename?
      filename: string;
      engine: SupportedEngine;
      dataStorageRef: string;
      templateStorageRef: string;
      outputStorageRef: string;
    }

    interface GeneratingFinishedContent {
      filename: string;
      publicOutputFileUrl: string;
      isDeleted: boolean;
    }

    interface NotifingFinishedContent {
      url: string;
      reason: "finished" | "error";
      payload: GeneratingFinishedContent | Error;
    }

    type Error =
      | ResourceDisabledError
      | DataFormatError
      | TemplateProcessingError
      | WebhookError
      | InternalServerError;

    // The template or version that users ask for is disabled.
    interface ResourceDisabledError {
      type: "ResourceDisabledError";
      message: string;
      code: 403;
    }

    interface DataFormatError {
      type: "DataFormatError";
      message: string;
      code: 400;
    }

    // The error happens during generating files
    interface TemplateProcessingError {
      type: "TemplateProcessingError";
      code: 500;
      stack: string;
    }

    // The error happens during processing webhook including getting a bad response, timeout, etc.
    interface WebhookError {
      type: "WebhookError";
      code: 502;
      message: string;
      url: string;
      payload?: string;
    }

    // Including all undefined error, help me to fix my bugs.
    interface InternalServerError {
      type: "InternalServerError";
      code: -1;
      message: string;
    }
  }
}
