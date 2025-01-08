declare namespace Express {
  export interface Request {
    userId?: string;
    task: Model.Task;
    template: Model.Template;
    rawBody?: Buffer;
  }
}
