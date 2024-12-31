import type { Request } from "express";
import cors from "cors";
import * as admin from "firebase-admin";

const db = admin.firestore();

export default cors(async (req: Request, callback) => {
  try {
    const doc = await db
      .collection("settings")
      .doc(req.userId ?? "")
      .get();
    callback(null, {
      origin: doc.get("accessControlAllowOrigin") ?? [],
    });
  } catch (e: any) {
    callback(e);
  }
});
