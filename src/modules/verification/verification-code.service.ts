import { randomInt } from "node:crypto";

export class VerificationCodeService {
    private static readonly LETTERS =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private static readonly DIGITS =
        "0123456789";

    public static generate(length: number): string {
        if (length < 2) {
            throw new Error(
                "Kod weryfikacyjny musi mieć co najmniej 2 znaki.",
            );
        }

        const characters: string[] = [];

        for (let i = 0; i < length; i++) {
            characters.push(
                this.randomFrom(
                    randomInt(0, 2) === 0
                        ? this.LETTERS
                        : this.DIGITS,
                ),
            );
        }

        this.ensureContains(characters, this.LETTERS);
        this.ensureContains(characters, this.DIGITS);

        return characters.join("");
    }

    private static randomFrom(pool: string): string {
        return pool[randomInt(0, pool.length)]!;
    }

    private static ensureContains(
        characters: string[],
        pool: string,
    ): void {
        const alreadyPresent =
            characters.some((char) =>
                pool.includes(char),
            );

        if (alreadyPresent) {
            return;
        }

        const index =
            randomInt(0, characters.length);

        characters[index] =
            this.randomFrom(pool);
    }
}