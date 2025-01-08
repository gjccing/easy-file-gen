import express from "express";
import { asyncErrorCatcher } from "~/utils";
import GeneralRepository from "~/store/GeneralRepository";

const repository = new GeneralRepository<Model.Task>("tasks");

const router = express.Router();

const fetchTask = asyncErrorCatcher(async (req, _, next) => {
  const task = await repository.fetchById(req.params.taskId);
  if (task) {
    req.task = task;
    next();
  } else next(404);
});

router.get("/:taskId", fetchTask, (req, res) => {
  res.status(200).send(req.task).end();
});

export default router;
