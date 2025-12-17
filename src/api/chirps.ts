import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { getUser } from "../db/queries/users.js";
import { createChirp } from "../db/queries/chirps.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
    type parameters = {
        body: string;
        userId: string;
    };

    const params: parameters = req.body;

    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
    }

    const words = params.body.split(" ");

    const badWords = ["kerfuffle", "sharbert", "fornax"];
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const loweredWord = word.toLowerCase();
        if (badWords.includes(loweredWord)) {
            words[i] = "****";
        }
    }

    const cleaned = words.join(" ");

    const user = await getUser(params.userId);

    if (!user) {
        throw new BadRequestError(`No user found for provided id`);
    }

    const chirp = await createChirp({ body: cleaned, userId: user.id })

    if (!chirp) {
        throw new Error("Could not create chirp");
    }

    respondWithJSON(res, 201, {
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: chirp.body,
        userId: chirp.userId,
    });
}
