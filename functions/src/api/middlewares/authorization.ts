import type { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import * as admin from "firebase-admin";
import { ErrorMessage } from "../../utils";

const db = admin.firestore();

const authorization: RequestHandler = async (req, res, next) => {
  const token = req.header("Authorization");
  try {
    if (token) {
      const payload: { userId: string; expiresAt?: number } = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      if (payload.expiresAt && payload.expiresAt >= Date.now()) return;
      const doc = await db.collection("settings").doc(payload.userId).get();
      if (!doc.exists) return;
      verify(token.slice(7), doc.get("apiToken.token"));
      req.userId = payload.userId;
      next();
    }
  } catch (e) {
    res
      .status(401)
      .send({ sessionId: req.sessionId, error: ErrorMessage["401"] });
  }
};

export default authorization;
