import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { Timestamp as ModelTimestamp } from "firebase/firestore";

export const addRecord = (db: admin.firestore.Firestore) =>
  function (data: Partial<Model.Record<any>>) {
    return db.collection("records").add({
      createdAt: Timestamp.now() as ModelTimestamp,
      editedAt: Timestamp.now() as ModelTimestamp,
      state: "processing",
      ...data,
    });
  };

export const updateRecord = (db: admin.firestore.Firestore) =>
  function (
    id: string,
    state: Model.Record<any>["state"],
    content: Model.Record<any>["content"]
  ) {
    return db
      .collection("records")
      .doc(id)
      .update({ state, content, editedAt: Timestamp.now() });
  };

export const getRecord = (db: admin.firestore.Firestore) => (id: string) =>
  db.collection("records").doc(id);
