import * as logger from "firebase-functions/logger";
import { PubSub } from "@google-cloud/pubsub";
import {
  getTopicByEngine,
  createDataMissingError,
  createSendRendererEndedEvent,
  createInternalServerError,
  createWebhookEndedEvent,
  createExecutionTimeoutError,
} from "~/utils";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import GeneralRepository from "~/store/GeneralRepository";
import TaskRepository from "~/store/TaskRepository";
import { scheduler } from "firebase-functions/v2";

const taskRepository = new TaskRepository();
const pubsub = new PubSub();

export async function sendGeneratingMessage(task: Model.Task) {
  await taskRepository.updateStateById(task.id, "GENERATING");
  const events: Model.Event[] = task.events;
  const event = events.find(({ name }) => name === "PreparationEndedEvent");
  if (event) {
    const PreparationEndedEvent = event as Model.PreparationEndedEvent;
    const messageId = await pubsub
      .topic(getTopicByEngine(PreparationEndedEvent.engine))
      .publishMessage({
        data: Buffer.from(JSON.stringify(PreparationEndedEvent)),
      });
    await taskRepository.logEvent(
      task.id,
      createSendRendererEndedEvent(task.id, messageId)
    );
    return;
  } else {
    await taskRepository.logEvent(
      task.id,
      createDataMissingError(task.id, "PreparationEndedEvent")
    );
    return 422;
  }
}

export const generatingResultPub = onMessagePublished(
  "generating-end-pub",
  async (event) => {
    let taskId: string | undefined;
    try {
      const data = JSON.parse(
        Buffer.from(event.data.message.data, "base64").toString()
      ) as Model.Event;
      taskId = data.taskId;
      await taskRepository.logEvent(taskId, data);
      const task = await taskRepository.fetchById(taskId);
      task && sendWebhook(task);
    } catch (error) {
      logger.error("InternalServerError", event, error);
      if (taskId)
        await taskRepository.logEvent(
          taskId,
          createInternalServerError(taskId)
        );
    }
  }
);

const settingRepository = new GeneralRepository<Model.Settings>("settings");

export async function sendWebhook(task: Model.Task) {
  const settings = await settingRepository.fetchById(task.userId);
  settings &&
    (await Promise.allSettled(
      (settings.webhooks as Array<Model.Webhook>).map(async (webhook) => {
        try {
          if (webhook.type === task.state) {
            for (let { retryLimit } = webhook; retryLimit; retryLimit--) {
              const resp = await fetch(webhook.url, {
                method: "POST",
                body: JSON.stringify(task),
              });
              await taskRepository.logEvent(
                task.id,
                await createWebhookEndedEvent(task.id, webhook, resp)
              );
              if (resp.ok) break;
            }
          }
        } catch (error) {
          logger.error("InternalServerError", error);
        }
      })
    ));
}

export const handleTimeoutTasks = scheduler.onSchedule(
  "every 5 minutes",
  async () => {
    const list = await taskRepository.fetchTimeoutTasks(5 * 60 * 1000);
    Promise.allSettled(
      list.map(async (task) => {
        const events = task.events;
        let newState = events.some(({ name }) => name.endsWith("Error"))
          ? "ERROR"
          : events.some((event) => event.name === "GenerationEndedEvent")
          ? "FINISHED"
          : task.state;
        if (task.state !== newState) {
          await taskRepository.updateStateById(task.id, newState);
          task.state = newState;
          await sendWebhook(task);
        } else if (task.state === "PREPARING") {
          await sendGeneratingMessage(task);
        } else if (task.state === "GENERATING") {
          if (events.every(({ name }) => name !== "SendRendererEndedEvent")) {
            await sendGeneratingMessage(task);
          } else {
            await taskRepository.logEvent(
              task.id,
              createExecutionTimeoutError(task.id)
            );
          }
        }
      })
    );
  }
);
