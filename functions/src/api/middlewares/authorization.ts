import type { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import GeneralRepository from "~/store/GeneralRepository";

const repository = new GeneralRepository<Model.Settings>("settings");

const authorization: RequestHandler = async (req, res, next) => {
  const token = req.header("Authorization");
  try {
    if (token) {
      const payload: { userId: string; expiresAt?: number } = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      if (payload.expiresAt && payload.expiresAt >= Date.now()) return;
      const settings = await repository.fetchById(payload.userId);
      if (!settings) return;
      verify(token.slice(7), settings.apiToken.token);
      req.userId = payload.userId;
      next();
    }
  } catch (e) {
    next(401);
  }
};

export default authorization;
