import { getUserByEmail } from "../db/queries/users.js";
import { createRefreshToken, revokeRefreshToken } from "../db/queries/refreshTokens.js";
import { getUserFromRefreshToken } from "../db/queries/users.js";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import { respondWithJSON } from "./json.js";
import { NotFoundError, UserNotAuthenticatedError } from "./errors.js";

import type { Request, Response } from "express";
import type { UserResponse } from "./users.js";
import { config } from "../config.js";
import { NewRefreshToken } from "../db/schema.js";

type LoginResponse = UserResponse & {
    token: string;
    refreshToken: string;
};

export async function handlerLogin(req: Request, res: Response) {
    type parameters = {
        password: string;
        email: string;
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

    let duration = config.jwt.defaultDuration;

    const accessToken = makeJWT(user.id, duration, config.jwt.secret);

    const token = makeRefreshToken();
    const days = 60;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const refreshToken = await createRefreshToken({
        userId: user.id,
        token: token,
        expiresAt: expiresAt,
        revokedAt: null,
    } satisfies NewRefreshToken);

    respondWithJSON(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: accessToken,
        refreshToken: refreshToken.token,
    } satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
    const accessToken = getBearerToken(req)
    const user = await getUserFromRefreshToken(accessToken)
    if (!user) {
        throw new UserNotAuthenticatedError("invalid token")
    }

    let duration = config.jwt.defaultDuration;

    const newAccessToken = makeJWT(user.id, duration, config.jwt.secret);

    respondWithJSON(res, 200, {
        token: newAccessToken,
    });
}

export async function handlerRevoke(req: Request, res: Response) {
    const refreshToken = getBearerToken(req)
    const updatedToken = await revokeRefreshToken(refreshToken)
    if (!updatedToken) {
        throw new UserNotAuthenticatedError("invalid token")
    }
    res.status(204).send();
}
