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
  }

  namespace Model {
    // Webhook interface
    interface Webhook {
      type: WebhookType;
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
    interface GenFileRecord {
      id: string;
      createdAt: Timestamp;
      refUserId: string;
      templateRef: string;
      recordRef?: GenFileRecord;
      action: "calling" | "finished" | "error" | "notifying";
      payload:
        | CallingPayload
        | FinishedPayload
        | ErrorPayload
        | NotifingPayload;
    }

    // Payload interfaces
    interface CallingPayload {
      callingUrl: string; // /template-id/filename?
      witnApiToken: string;
      templateId: string;
      filename: string;
      dataStorageRef: string;
      outputStorageRef: string;
    }

    interface FinishedPayload {
      filename: string;
      outputStorageRef: string;
      isDeleted: boolean;
    }

    interface ErrorPayload {
      sourceUrl: string; // /template-id/version-id or customTag/filename?
      errorType:
        | AuthorizationError
        | ResourceNotFoundError
        | ResourceDisabledError
        | TemplateProcessingError
        | WebhookError
        | InternalServerError
        | QuotaExceededError;
    }

    // The api is because of trigger this service with s wrong apitoken
    interface AuthorizationError {
      type: "AuthorizationError";
      code: 401;
      message: string;
    }

    // The template or version that users ask for does not exist.
    interface ResourceNotFoundError {
      type: "ResourceNotFoundError";
      code: 404;
      message: string;
    }

    // The template or version that users ask for is disabled.
    interface ResourceDisabledError {
      type: "ResourceDisabledError";
      code: 403;
      message: string;
    }

    // The error happens during generating files
    interface TemplateProcessingError {
      type: "TemplateProcessingError";
      code: 500;
      message: string;
      errorLogRef: string;
    }

    // The error happens during processing webhook including getting a bad response, timeout, etc.
    interface WebhookError {
      type: "WebhookError";
      code: 502;
      message: string;
      errorLogRef: string;
    }

    // Including all undefined error, help me to fix my bugs.
    interface InternalServerError {
      type: "InternalServerError";
      code: -1;
      message: string;
      errorLogRef: string;
      resolved: boolean; // Make users know this problem is solved.
    }

    // Users have used over their quota, but I am not sure, I wanna bill it by pay-as-you-go
    interface QuotaExceededError {
      type: "QuotaExceededError";
      code: 429;
      message: string;
      budget: number;
      exceededAmount: number;
    }

    interface NotifingPayload {
      url: string;
      headers: { key: string; value: string };
      reason: "finished" | "error";
      content: FinishedPayload | ErrorPayload;
    }
  }
}
