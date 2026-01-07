import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users, refreshTokens } from "../schema.js";

export async function createUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function reset() {
    await db.delete(users);
}

export async function getUserByEmail(email: string) {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
}

export async function getUserFromRefreshToken(token: string) {
    const [row] = await db.select({ user: users }).from(users).innerJoin(refreshTokens, eq(users.id, refreshTokens.userId)).where(and(eq(refreshTokens.token, token), isNull(refreshTokens.revokedAt), gt(refreshTokens.expiresAt, new Date())));
    return row?.user;
}
