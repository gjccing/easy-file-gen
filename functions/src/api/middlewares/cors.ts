import type { RequestHandler } from "express";
import type { Request } from "express";
import cors from "cors";
import * as admin from "firebase-admin";

const db = admin.firestore();

const resetCorsFromFirebase: RequestHandler = (req, res, next) => {
  res.removeHeader("Access-Control-Allow-Origin");
  res.removeHeader("Access-Control-Allow-Methods");
  res.removeHeader("Access-Control-Allow-Credentials");
  res.removeHeader("Access-Control-Allow-Headers");
  res.removeHeader("Access-Control-Expose-Headers");
  res.removeHeader("Access-Control-Max-Age");
  next();
};

const _cors = cors(async (req: Request, callback) => {
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

export default [resetCorsFromFirebase, _cors];
