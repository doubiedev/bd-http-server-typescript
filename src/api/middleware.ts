import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";

export function middlewareLogResponse(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    res.on("finish", () => {
        const statusCode = res.statusCode;

        if (statusCode >= 300) {
            console.log(
                `[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`,
            );
        }
    });

    next();
}

export function middlewareMetricsInc(
    _: Request,
    __: Response,
    next: NextFunction,
) {
    config.fileServerHits++;
    next();
}

export function errorMiddleWare(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (err instanceof BadRequestError) {
        respondWithError(res, 400, err.message)
    } else if (err instanceof NotFoundError) {
        res.status(404).send("Not Found")
    } else {
        res.status(500).send("Internal Server Error")
    }
}

