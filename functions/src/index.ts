import * as admin from "firebase-admin";

if (admin.apps.length === 0) admin.initializeApp();

export { call, state } from "./call";
export { generate, handleTopicGeneratingResult } from "./generate";
export { notifyFinished, notifyError } from "./notify";
