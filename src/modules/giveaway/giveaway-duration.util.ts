/**
 * Parsuje ciąg znaków opisujący czas trwania konkursu, np.:
 *
 * "30s"      -> 30 sekund
 * "10m"      -> 10 minut
 * "2h"       -> 2 godziny
 * "1d"       -> 1 dzień
 * "1w"       -> 1 tydzień
 * "1d12h30m" -> 1 dzień, 12 godzin i 30 minut (jednostki można łączyć)
 *
 * Zwraca liczbę milisekund albo `null`, jeśli format jest niepoprawny.
 */

const UNIT_TO_MS: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000,
};

const DURATION_PATTERN = /(\d+)\s*(s|m|h|d|w)/gi;

const MIN_DURATION_MS = 10_000; // 10 sekund
const MAX_DURATION_MS = 90 * 86_400_000; // 90 dni

export class GiveawayDurationUtil {
    public static parse(input: string): number | null {
        const normalized = input.trim().toLowerCase();

        if (!normalized) {
            return null;
        }

        const matches = [
            ...normalized.matchAll(DURATION_PATTERN),
        ];

        if (matches.length === 0) {
            return null;
        }

        const consumedLength = matches.reduce(
            (sum, match) => sum + match[0].length,
            0,
        );

        if (
            consumedLength !==
            normalized.replace(/\s+/g, "").length
        ) {
            return null;
        }

        let totalMs = 0;

        for (const match of matches) {
            const amountText = match[1];
            if (amountText === undefined) {
                return null;
            }

            const amount = Number.parseInt(amountText, 10);
            const unit = match[2];
            if (unit === undefined) {
                return null;
            }

            const unitMs = UNIT_TO_MS[unit];
            if (unitMs === undefined) {
                return null;
            }

            totalMs += amount * unitMs;
        }

        if (
            totalMs < MIN_DURATION_MS ||
            totalMs > MAX_DURATION_MS
        ) {
            return null;
        }

        return totalMs;
    }

    public static isValid(input: string): boolean {
        return this.parse(input) !== null;
    }
}
