import { prisma } from "../../core/database/prisma.js";
import {
    GIVEAWAY_ID_ALPHABET,
    GIVEAWAY_ID_LENGTH,
} from "./giveaway.constants.js";

export class GiveawayIdService {
    public static async generateUnique(): Promise<string> {
        for (let attempt = 0; attempt < 10; attempt++) {
            const candidate = this.generate();

            const existing =
                await prisma.giveaway.findUnique({
                    where: {
                        id: candidate,
                    },
                    select: {
                        id: true,
                    },
                });

            if (!existing) {
                return candidate;
            }
        }

        throw new Error(
            "GIVEAWAY_ID_GENERATION_FAILED",
        );
    }

    private static generate(): string {
        let id = "";

        for (let i = 0; i < GIVEAWAY_ID_LENGTH; i++) {
            const index = Math.floor(
                Math.random() * GIVEAWAY_ID_ALPHABET.length,
            );

            id += GIVEAWAY_ID_ALPHABET[index];
        }

        return id;
    }
}
