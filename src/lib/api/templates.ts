import type { QuerySnapshot, DocumentSnapshot } from "firebase/firestore";
import {
  query,
  collection,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "~/lib/firebase";
import { firestoreAutoId } from "~/lib/utils";
import { OutputType, SupportedEngine } from "~/global.d";
import md5 from "md5";

export const getTemplates = async (limitNumber: number) => {
  await auth.authStateReady();
  const querySnapshot = (await getDocs(
    query(
      collection(db, "templates"),
      where("authorId", "==", auth.currentUser?.uid),
      where("isDeleted", "!=", true),
      orderBy("createdAt", "desc"),
      limit(limitNumber)
    )
  )) as QuerySnapshot<Model.Template>;
  return querySnapshot.docs.map((doc) => doc.data());
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
    template.contentStorageRef.match(/(?<=.+)(?<=\/)([\.\w]+)$/)?.[0] ?? "";
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

async function replaceFileNameWithMD5(file?: File) {
  if (file) {
    const md5hash = await file.text().then(md5);
    const contentExtFileName = file.name.match(/\.(\w+)$/)?.[1] ?? "";
    return `${md5hash}.${contentExtFileName}`;
  }
  return "";
}

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
  const contentStorageRef = `users/${
    auth.currentUser?.uid
  }/${id}/${await replaceFileNameWithMD5(content)}`;
  const compiledContentStorageRef = `users/${
    auth.currentUser?.uid
  }/${id}/${await replaceFileNameWithMD5(compiledContent)}`;

  const template: Model.Template = {
    id,
    authorId: auth.currentUser?.uid ?? "",
    createdAt: Timestamp.now(),
    editedAt: Timestamp.now(),
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
  const contentStorageRef = `users/${auth.currentUser?.uid}/${
    template.id
  }/${await replaceFileNameWithMD5(content)}`;
  const compiledContentStorageRef = `users/${auth.currentUser?.uid}/${
    template.id
  }/${await replaceFileNameWithMD5(compiledContent)}`;

  return await Promise.all([
    setDoc(doc(db, "templates", template.id), {
      ...template,
      contentStorageRef,
      ...(compiledContent ? { compiledContentStorageRef } : null),
    }),
    template.contentStorageRef !== contentStorageRef &&
      content.text().then((text) =>
        uploadString(ref(storage, contentStorageRef), text, "raw", {
          contentType: content.type,
        })
      ),
    template.compiledContentStorageRef !== compiledContentStorageRef &&
      compiledContent?.text().then((text) =>
        uploadString(ref(storage, compiledContentStorageRef), text, "raw", {
          contentType: compiledContent.type,
        })
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
