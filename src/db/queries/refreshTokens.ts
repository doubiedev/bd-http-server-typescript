import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export async function createRefreshToken(refreshToken: NewRefreshToken) {
    const [result] = await db
        .insert(refreshTokens)
        .values(refreshToken)
        .returning();
    return result;
}

export async function revokeRefreshToken(token: string) {
    const rows = await db
        .update(refreshTokens)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(refreshTokens.token, token))
        .returning()
    if (rows.length === 0) {
        return;
    }
    return rows[0];
}
