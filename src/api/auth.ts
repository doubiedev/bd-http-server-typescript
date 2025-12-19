import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { respondWithJSON } from "./json.js";
import { UserNotAuthenticatedError } from "./errors.js";

import type { Request, Response } from "express";
import type { LoginResponse } from "./users.js";
import { config } from "../config.js";

export async function handlerLogin(req: Request, res: Response) {
    type parameters = {
        password: string;
        email: string;
        expiresInSeconds?: number;
    };

    const params: parameters = req.body;

    const user = await getUserByEmail(params.email);
    if (!user) {
        throw new UserNotAuthenticatedError("invalid username or password");
    }

    const matching = await checkPasswordHash(
        params.password,
        user.hashedPassword,
    );
    if (!matching) {
        throw new UserNotAuthenticatedError("invalid username or password");
    }

    let expiresInSeconds = 60 * 60;
    if (params.expiresInSeconds !== undefined && (params.expiresInSeconds > 0 || params.expiresInSeconds < 60 * 60)) {
        expiresInSeconds = params.expiresInSeconds;
    }

    const token = makeJWT(user.id, expiresInSeconds, config.api.jwtSecret)

    respondWithJSON(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: token,
    } satisfies LoginResponse);
}

