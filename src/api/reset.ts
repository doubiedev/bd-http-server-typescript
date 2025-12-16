import type { Request, Response } from "express";
import { config } from "../config.js";
import { deleteUsers } from "../db/queries/users.js";

export async function handlerReset(_: Request, res: Response) {
    await deleteUsers()
    config.api.fileServerHits = 0;
    res.write("Hits reset to 0. All users deleted from db.");
    res.end();
}
