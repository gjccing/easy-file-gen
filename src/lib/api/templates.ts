import type {
  CollectionReference,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
} from "firebase/firestore";
import {
  query,
  collection,
  where,
  orderBy,
  startAfter,
  endBefore,
  limit,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
  limitToLast,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "~/lib/firebase";
import { firestoreAutoId } from "~/lib/utils";
import { OutputType, SupportedEngine } from "~/global.d";

async function buildTemplateListQuery(): Promise<
  [CollectionReference<DocumentData, DocumentData>, ...QueryConstraint[]]
> {
  await auth.authStateReady();
  return [
    collection(db, "templates"),
    where("authorId", "==", auth.currentUser?.uid),
    where("isDeleted", "!=", true),
    orderBy("createdAt", "desc"),
  ];
}

function convertSnapshotToTemplateList(
  snapshot: QuerySnapshot<Model.Template, DocumentData>
) {
  return snapshot.docs.map<Model.Template>((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
}

export const getTemplateDocsFirstPage = async (perPage: number) => {
  const querySnapshot = (await getDocs(
    query(...(await buildTemplateListQuery()), limit(perPage))
  )) as QuerySnapshot<Model.Template>;
  return convertSnapshotToTemplateList(querySnapshot);
};

export const getTemplateDocsStartAfterCreateAt = async (
  startAfterCreateAt: Timestamp,
  perPage: number
) => {
  const querySnapshot = (await getDocs(
    query(
      ...(await buildTemplateListQuery()),
      limit(perPage),
      startAfter(startAfterCreateAt)
    )
  )) as QuerySnapshot<Model.Template>;
  return convertSnapshotToTemplateList(querySnapshot);
};

export const getTemplateDocsEndBeforeCreateAt = async (
  endBeforeCreateAt: Timestamp,
  perPage: number
) => {
  const querySnapshot = (await getDocs(
    query(
      ...(await buildTemplateListQuery()),
      limitToLast(perPage),
      endBefore(endBeforeCreateAt)
    )
  )) as QuerySnapshot<Model.Template>;
  return convertSnapshotToTemplateList(querySnapshot);
};

export const getTemplateById = async (id: string) => {
  await auth.authStateReady();
  const templateDoc = (await getDoc(
    doc(db, "templates", id)
  )) as DocumentSnapshot<Model.Template>;
  return {
    ...templateDoc.data(),
    id: templateDoc.id,
  } as Model.Template;
};

export const getTemplateAndContentById = async (id: string) => {
  await auth.authStateReady();
  const templateDoc = (await getDoc(
    doc(db, "templates", id)
  )) as DocumentSnapshot<Model.Template>;
  const template = {
    ...templateDoc.data(),
    id: templateDoc.id,
  } as Model.Template;
  const fileName =
    template.contentStorageRef.match(/(?<=\/\w+-)[^/]+?$/)?.[0] ?? "";
  const response = await fetch(
    await getDownloadURL(ref(storage, template.contentStorageRef))
  );
  const result: [Model.Template, File] = [
    template,
    new File([await response.blob()], fileName, {
      type: response.headers.get("content-type") ?? "text/plain",
    }),
  ];
  return result;
};

export const createNewTemplate = async ({
  content,
  compiledContent,
  ...data
}: {
  name: string;
  outputType: OutputType;
  description: string;
  engine: SupportedEngine;
  enabled: boolean;
  content: File;
  compiledContent?: File;
}) => {
  await auth.authStateReady();
  const id = firestoreAutoId();
  const contentStorageRef = `users/${auth.currentUser?.uid}/${id}-${content.name}`;
  const compiledContentStorageRef = `users/${auth.currentUser?.uid}/${id}-${compiledContent?.name}`;
  const template: Model.Template = {
    id,
    authorId: auth.currentUser?.uid ?? "",
    createdAt: Timestamp.now(),
    editedAt: Timestamp.now(),
    callingCount: 0,
    errorCount: 0,
    ...data,
    contentStorageRef,
    ...(compiledContent ? { compiledContentStorageRef } : null),
    isDeleted: false,
  };
  return await Promise.all([
    setDoc(doc(db, "templates", id), template),
    content.text().then((text) =>
      uploadString(ref(storage, contentStorageRef), text, "raw", {
        contentType: content.type,
      })
    ),
    compiledContent?.text().then((text) =>
      uploadString(ref(storage, compiledContentStorageRef), text, "raw", {
        contentType: compiledContent.type,
      })
    ),
  ]);
};

export const updateTemplate = async ({
  content,
  compiledContent,
  ...template
}: Model.Template & { content: File; compiledContent?: File }) => {
  await auth.authStateReady();
  template.editedAt = Timestamp.now();
  return await Promise.all([
    setDoc(doc(db, "templates", template.id), template),
    content.text().then((text) =>
      uploadString(ref(storage, template.contentStorageRef), text, "raw", {
        contentType: content.type,
      })
    ),
    compiledContent?.text().then((text) =>
      uploadString(
        ref(storage, template.compiledContentStorageRef),
        text,
        "raw",
        {
          contentType: compiledContent.type,
        }
      )
    ),
  ]);
};

export const enableTemplateById = async (id: string, enabled: boolean) => {
  await auth.authStateReady();
  return await updateDoc(doc(db, "templates", id), {
    enabled,
    editedAt: Timestamp.now(),
  });
};

export const deleteTemplateById = async (id: string) => {
  await auth.authStateReady();
  return await updateDoc(doc(db, "templates", id), {
    isDeleted: true,
    editedAt: Timestamp.now(),
  });
};
