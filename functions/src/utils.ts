import type { OutputType, SupportedEngine } from "../../src/global";

export const ErrorConstructor = {
  "403": (source: Error): Model.ResourceDisabledError => ({
    type: "ResourceDisabledError",
    code: 403,
    message: source.toString(),
  }),
  "400": (source: Error): Model.DataFormatError => ({
    type: "DataFormatError",
    code: 400,
    message: source.toString(),
  }),
  "500": (source: Error): Model.TemplateProcessingError => ({
    type: "TemplateProcessingError",
    code: 500,
    stack: source.toString(),
  }),
  "502": (source: Error, url: string): Model.WebhookError => ({
    type: "WebhookError",
    code: 502,
    message: source.toString(),
    url,
  }),
  "-1": (source: any): Model.InternalServerError => ({
    type: "InternalServerError",
    code: -1,
    message: source.toString(),
  }),
};

export const ErrorMessage = {
  "403": "The target template is disabled.",
  "400": "The uploaded data format is unsupported, expected the JSON format.",
  "500": "",
  "502": "",
  "-1": "Internal Server Error: An unexpected issue occurred on our server. Please contact us for assistance if the problem persists. We apologize for the inconvenience.",
};

export const getContentTypeByOutputType = (type: OutputType) => {
  switch (type) {
    case "PDF":
      return "application/pdf";
  }
  return "";
};

export const getTopicByEngine = (engine: SupportedEngine) => {
  switch (engine) {
    case "@react-pdf/renderer@3.4.4":
      return "react_pdf_renderer_3_4_4";
  }
  return "";
};
