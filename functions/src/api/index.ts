import { onRequest } from "firebase-functions/v1/https";
import * as logger from "firebase-functions/logger";
import express, { ErrorRequestHandler } from "express";
import helmet from "helmet";
import authorization from "./middlewares/authorization";
import corsForPublic from "cors";
import cors from "./middlewares/cors";

import triggerRoutes from "./routes/trigger.route";
import stateRoutes from "./routes/state.route";

const app = express();

app.use(helmet());
app.options("*", corsForPublic());
app.use(authorization);
app.use(cors);

app.use("/trigger", triggerRoutes);
app.use("/state", stateRoutes);

app.use((async (err, req, res, _) => {
  let code: number, message: string;
  switch (err) {
    case 400:
      code = err;
      message =
        "The request content is empty. Please bring JSON data or upload a JSON file for generating the file.";
      break;
    case 401:
      code = err;
      message = "User authentication failed.";
      break;
    case 404:
      code = err;
      message = "The requested resource does not exist.";
      break;
    default:
      logger.error("InternalServerError", err, req.path);
      code = 500;
      message =
        "Internal Server Error: An unexpected issue occurred on our server. Please contact us for fixing the problem. We apologize for the inconvenience.";
  }
  res.status(code).send({ message });
}) as ErrorRequestHandler);

export const api = onRequest(app);
