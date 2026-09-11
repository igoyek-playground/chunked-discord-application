/**
 * Prefiksy customId komponentów konkursu.
 *
 * Do przycisku doklejany jest zawsze ID konkursu, np.:
 * "giveaway:join:ab12cd" / "giveaway:leave:ab12cd"
 *
 * Dzięki temu jeden handler eventu obsługuje przyciski
 * wszystkich (także wielu równoległych) konkursów.
 */
export const GIVEAWAY_CUSTOM_IDS = {
    join: "giveaway:join",
    leave: "giveaway:leave",
} as const;

/**
 * Alfabet używany do generowania unikatowego ID konkursu
 * (małe litery + cyfry, zgodnie ze specyfikacją).
 */
export const GIVEAWAY_ID_ALPHABET =
    "abcdefghijklmnopqrstuvwxyz0123456789";

export const GIVEAWAY_ID_LENGTH = 6;

/**
 * Maksymalne opóźnienie, jakie może przyjąć `setTimeout` w Node.js
 * (2^31 - 1 ms, ok. 24.8 dnia). Dłuższe konkursy są dogrywane przez
 * cykliczny "sweep" zamiast pojedynczego timera.
 */
export const MAX_SAFE_TIMEOUT_MS = 2 ** 31 - 1;
