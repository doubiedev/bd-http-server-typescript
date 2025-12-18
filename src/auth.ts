import argon2 from "argon2";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export async function hashPassword(password: string) {
    return argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string) {
    return argon2.verify(hash, password);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const iat = Math.floor(Date.now() / 1000);

    const payload: payload = {
        iss: "chirpy",
        sub: userID,
        iat: iat,
        exp: iat + expiresIn
    }

    const token = jwt.sign(payload, secret);
    return token;
}

export function validateJWT(tokenString: string, secret: string): string {
    try {
        const decoded: payload | string = jwt.verify(tokenString, secret);

        if (typeof decoded === "object" && decoded !== null) {
            const userID = decoded["sub"];
            if (!userID) {
                throw new Error("Invalid token: no userID");
            }

            return userID;
        } else {
            throw new Error("Invalid token shape");
        }

    } catch (err) {
        throw new Error("Invalid token");
    }
}
