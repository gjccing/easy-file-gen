import * as admin from "firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { firestoreAutoId } from "~/utils";
import GeneralRepository from "./GeneralRepository";

const bucket = admin.storage().bucket();

export default class TaskRepository extends GeneralRepository<Model.Task> {
  constructor() {
    super("tasks");
  }

  async addNewTask(userId: string, templateId: string) {
    return await super.setById(firestoreAutoId(), {
      userId,
      templateId,
      state: "PREPARING",
      events: [],
    });
  }

  async updateStateById(id: string, state: Model.Task["state"]) {
    await this.updateById(id, { state });
  }

  async logEvent(taskId: string, event: Model.Event) {
    let newValue: { state: Model.Task["state"]; downloadURL?: string } | null =
      null;
    if (event.name === "GenerationEndedEvent") {
      const outputRef = bucket.file(event.outputStorageRef);
      await outputRef.makePublic();
      newValue = {
        state: "FINISHED",
        downloadURL: outputRef.publicUrl(),
      };
    } else if (event.name.endsWith("Error")) newValue = { state: "ERROR" };

    await this.updateById(taskId, {
      editedAt: Timestamp.now(),
      ...newValue,
      events: FieldValue.arrayUnion(event),
    });
  }

  async fetchTimeoutTasks(timeout: number): Promise<Model.Task[]> {
    const snapshot = await this.collectionRef
      .where("state", "in", ["PREPARING", "GENERATING"])
      .where("editedAt", "<", new Date(Date.now() - timeout))
      .get();
    return snapshot.docs.map((doc) => doc.data() as Model.Task);
  }
}
