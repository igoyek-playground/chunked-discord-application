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

        const letterCount = randomInt(
            1,
            length,
        );

        const digitCount =
            length - letterCount;

        const characters: string[] = [];

        for (let i = 0; i < letterCount; i++) {
            characters.push(
                this.getRandomCharacter(
                    this.LETTERS,
                ),
            );
        }

        for (let i = 0; i < digitCount; i++) {
            characters.push(
                this.getRandomCharacter(
                    this.DIGITS,
                ),
            );
        }

        return this.shuffle(
            characters,
        ).join("");
    }

    private static getRandomCharacter(
        characters: string,
    ): string {
        return characters[
            randomInt(0, characters.length)
        ];
    }

    private static shuffle(
        characters: string[],
    ): string[] {
        for (
            let i = characters.length - 1;
            i > 0;
            i--
        ) {
            const j = randomInt(
                0,
                i + 1,
            );

            [
                characters[i],
                characters[j],
            ] = [
                characters[j],
                characters[i],
            ];
        }

        return characters;
    }
}