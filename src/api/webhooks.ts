import type { Request, Response } from "express";
import { upgradeChirpyRed } from "../db/queries/users.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";

export async function handlerWebhook(req: Request, res: Response) {
    type parameters = {
        event: string;
        data: {
            userId: string;
        };
    };

    const polkaAPIKey = await getAPIKey(req);

    if (polkaAPIKey !== config.api.polka) {
        res.status(401).send();
        return;
    }

    const params: parameters = req.body;

    if (params.event !== "user.upgraded") {
        res.status(204).send();
        return;
    }

    await upgradeChirpyRed(params.data.userId);

    res.status(204).send();
}

