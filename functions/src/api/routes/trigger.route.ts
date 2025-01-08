import * as admin from "firebase-admin";
import express from "express";
import Busboy from "busboy";
import { Readable } from "stream";
import { asyncErrorCatcher, createPreparationEndedEvent } from "~/utils";
// import { sendGeneratingMessage } from "~/task";
import GeneralRepository from "~/store/GeneralRepository";
import TaskRepository from "~/store/TaskRepository";

const bucket = admin.storage().bucket();

const templateRepository = new GeneralRepository<Model.Template>("templates");
const taskRepository = new TaskRepository();

const router = express.Router();

const checkRequestedTemplate = asyncErrorCatcher(async (req, _, next) => {
  const template = await templateRepository.fetchById(req.params.templateId);
  if (!template) {
    next(404);
  } else if (!template.enabled) {
    next(403);
  } else {
    req.template = template;
    next();
  }
});

const createTask = asyncErrorCatcher(async (req, _, next) => {
  req.task = await taskRepository.addNewTask(
    req.userId ?? "",
    req.params.templateId
  );
  next();
});

const saveUpload = asyncErrorCatcher(async (req, _, next) => {
  const fileRef = bucket.file(`input/${req.userId}/${req.task.id}.json`);
  if (req.header("Content-Type")?.startsWith("multipart/form-data")) {
    const [, file] = await new Promise<[string, Readable, Busboy.FileInfo]>(
      (res, rej) => {
        Busboy({
          headers: req.headers as any,
        })
          .on("file", (name, file, info) => res([name, file, info]))
          .on("error", rej)
          .end(req.rawBody);
      }
    );
    await fileRef.save(file, { contentType: "application/json" });
    next();
  } else if (req.rawBody) {
    await fileRef.save(req.rawBody, { contentType: "application/json" });
    next();
  } else {
    next(400);
  }
});

const endPreparationTask = asyncErrorCatcher(async (req, _, next) => {
  const event = createPreparationEndedEvent(
    req.userId ?? "",
    req.task.id,
    req.params.filename,
    req.template
  );
  await taskRepository.logEvent(req.task.id, event);
  req.task.events.push(event);
  next();
});

router.post(
  "/:templateId/:filename",
  checkRequestedTemplate,
  createTask,
  saveUpload,
  endPreparationTask,
  async (req, res, next) => {
    const error = await Promise.race([
      // sendGeneratingMessage(req.task),
      new Promise((res) => setTimeout(res, 10)),
    ]);
    if (error) next(error);
    else res.status(200).send(req.task).end();
  }
);

export default router;
