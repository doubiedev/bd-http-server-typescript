import type { Request, Response } from "express";

import { respondWithJSON, respondWithError } from "./json.js";

export async function handlerChirpsValidate(req: Request, res: Response) {
    type parameters = {
        body: string;
    };

    const params: parameters = req.body;

    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        respondWithError(res, 400, "Chirp is too long");
        return;
    }

    const badWords = ["kerfuffle", "sharbert", "fornax"]; // ensure all are lowercase
    const words = params.body.split(" ");
    for (let i = 0; i < words.length; i++) {
        for (let j = 0; j < badWords.length; j++) {
            if (words[i].toLowerCase() === badWords[j]) {
                words[i] = "****";
            }
        }
    }
    const cleanedBody = words.join(" ");

    respondWithJSON(res, 200, {
        cleanedBody: cleanedBody,
    });
}
