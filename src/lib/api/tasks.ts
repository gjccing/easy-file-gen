import type {
  QuerySnapshot,
  CollectionReference,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import {
  query,
  collection,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  startAfter,
} from "firebase/firestore";
import { auth, db } from "~/lib/firebase";

async function buildTasksQuery(
  templateId: string
): Promise<
  [CollectionReference<DocumentData, DocumentData>, ...QueryConstraint[]]
> {
  await auth.authStateReady();
  return [
    collection(db, "tasks"),
    where("authorId", "==", auth.currentUser?.uid),
    where("templateId", "==", templateId),
    orderBy("createdAt", "desc"),
  ];
}

export const getTaskFirstPage = async (templateId: string, perPage: number) => {
  await auth.authStateReady();
  const querySnapshot = (await getDocs(
    query(
      collection(db, "tasks"),
      where("userId", "==", auth.currentUser?.uid),
      where("templateId", "==", templateId),
      orderBy("createdAt", "desc"),
      limit(perPage)
    )
  )) as QuerySnapshot<Model.Task>;
  return querySnapshot.docs.map((doc) => doc.data());
};

export const getTaskPageStartAfterCreateAt = async (
  templateId: string,
  perPage: number,
  createAt: Timestamp
) => {
  await auth.authStateReady();
  const querySnapshot = (await getDocs(
    query(
      collection(db, "tasks"),
      where("userId", "==", auth.currentUser?.uid),
      where("templateId", "==", templateId),
      orderBy("createdAt", "desc"),
      limit(perPage),
      startAfter(createAt)
    )
  )) as QuerySnapshot<Model.Task>;
  return querySnapshot.docs.map((doc) => doc.data());
};
