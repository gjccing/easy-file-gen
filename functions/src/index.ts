import * as admin from "firebase-admin";

if (admin.apps.length === 0) admin.initializeApp();

export { api } from "./api";
export { generatingResultSub, handleTimeoutTasks } from "./task";
