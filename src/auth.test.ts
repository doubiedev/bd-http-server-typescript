import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT, getBearerToken } from "./auth";
import { UserNotAuthenticatedError } from "./api/errors.js";
import type { Request } from "express";

describe("Password Hashing", () => {
    const password1 = "correctPassword123!";
    const password2 = "anotherPassword456!";
    let hash1: string;
    let hash2: string;

    beforeAll(async () => {
        hash1 = await hashPassword(password1);
        hash2 = await hashPassword(password2);
    });

    it("should return true for the correct password", async () => {
        const result = await checkPasswordHash(password1, hash1);
        expect(result).toBe(true);
    });

    it("should return false for an incorrect password", async () => {
        const result = await checkPasswordHash("wrongPassword", hash1);
        expect(result).toBe(false);
    });

    it("should return false when password doesn't match a different hash", async () => {
        const result = await checkPasswordHash(password1, hash2);
        expect(result).toBe(false);
    });

    it("should return false for an empty password", async () => {
        const result = await checkPasswordHash("", hash1);
        expect(result).toBe(false);
    });

    it("should return false for an invalid hash", async () => {
        const result = await checkPasswordHash(password1, "invalidhash");
        expect(result).toBe(false);
    });
});

describe("JWT Functions", () => {
    const secret = "secret";
    const wrongSecret = "wrong_secret";
    const userID = "some-unique-user-id";
    let validToken: string;
    const goodReq = {
        get: (header: string) => {
            if (header === "Authorization") {
                return "Bearer mytoken";
            }
            return undefined;
        },
    } as Request;
    const badReqEmptyToken = {
        get: (header: string) => {
            if (header === "Authorization") {
                return "Bearer ";
            }
            return undefined;
        },
    } as Request;
    const badReqUndefined = {
        get: (header: string) => {
            if (header === "Authorization") {
                return undefined;
            }
            return undefined;
        },
    } as Request;

    beforeAll(() => {
        validToken = makeJWT(userID, 3600, secret);
    });

    it("should validate a valid token", () => {
        const result = validateJWT(validToken, secret);
        expect(result).toBe(userID);
    });

    it("should throw an error for an invalid token string", () => {
        expect(() => validateJWT("invalid.token.string", secret)).toThrow(
            UserNotAuthenticatedError,
        );
    });

    it("should throw an error when the token is signed with a wrong secret", () => {
        expect(() => validateJWT(validToken, wrongSecret)).toThrow(
            UserNotAuthenticatedError,
        );
    });

    it("should should return the token for a valid request", () => {
        expect(getBearerToken(goodReq)).toEqual("mytoken");
    });

    it("should throw an error when the request has no authorization header", () => {
        expect(() => getBearerToken(badReqUndefined)).toThrow(
            UserNotAuthenticatedError,
        );
    });

    it("should throw an error when the request has an empty bearer token", () => {
        expect(() => getBearerToken(badReqEmptyToken)).toThrow(
            UserNotAuthenticatedError,
        );
    });
});

