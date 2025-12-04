import type { Request, Response } from "express";
import { apiConfig } from "../config.js";

export function handlerMetrics(_: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(`Hits: ${apiConfig.fileserverHits}`);
}

export function handlerResetMetrics(_: Request, res: Response) {
    apiConfig.fileserverHits = 0;
    res.status(200).send();
}
