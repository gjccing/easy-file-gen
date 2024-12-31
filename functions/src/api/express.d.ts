declare namespace Express {
  export interface Request {
    userId?: string;
    template?: Model.Template;
    recordId?: string;
    sessionId?: string;
    datadataStorageRef?: string;
    outputStorageRef?: string;
    rawBody?: Buffer;
    done?: boolean;
  }
}
