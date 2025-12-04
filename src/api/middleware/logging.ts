import { NextFunction, Request, Response } from "express";

function middlewareLogResponses(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    res.on("finish", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
            console.log(
                `[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`,
            );
        }
    });
    next();
}

export default middlewareLogResponses;
