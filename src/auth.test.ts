import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT } from "./auth";

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
});

describe("JWTs", () => {
    const userID = "gimlisonofgloin69";
    const expiresIn = 1000
    const secret = "lordoftherings";

    it("should return userID for a valid JWT", async () => {
        const token = makeJWT(userID, expiresIn, secret);
        const result = validateJWT(token, secret);
        expect(result).toBe(userID);
    });
});
