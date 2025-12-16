import type { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { createUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";

export async function handlerCreateUser(req: Request, res: Response) {
    const email = req.body.email;
    if (!email) {
        throw new BadRequestError("No email found in request body")
    }

    const newUser: NewUser = {
        email: `${email}`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
    }
    const user = await createUser(newUser)
    if (!user) {
        throw new BadRequestError("User already exists")
    }

    res.status(201).json(user)
}
