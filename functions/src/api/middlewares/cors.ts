import type { Request } from "express";
import cors from "cors";
import GeneralRepository from "~/store/GeneralRepository";

const repository = new GeneralRepository<Model.Settings>("settings");

export default cors(async (req: Request, callback) => {
  try {
    const settings = await repository.fetchById(req.userId ?? "");
    callback(null, {
      origin: settings?.accessControlAllowOrigin ?? [],
    });
  } catch (e: any) {
    callback(e);
  }
});
