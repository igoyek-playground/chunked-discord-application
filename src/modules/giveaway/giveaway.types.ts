import type { HexColorString } from "discord.js";

/**
 * Status konkursu.
 *
 * Trzymany jako zwykły string, bo SQLite (connector Prisma) nie
 * wspiera naprawdę natywnych enumów — walidacja typu odbywa się
 * więc po stronie aplikacji.
 */
export type GiveawayStatus = "ACTIVE" | "ENDED" | "CANCELLED";

export const GIVEAWAY_STATUS = {
    active: "ACTIVE",
    ended: "ENDED",
    cancelled: "CANCELLED",
} as const satisfies Record<string, GiveawayStatus>;

export interface GiveawayConfig {
    /**
     * Uprawnienie wymagane do zarządzania konkursami
     * (start / force-stop / cancel / reroll / set-time / set-winners).
     * Dołączanie do konkursu przyciskiem nie wymaga żadnych uprawnień.
     */
    managePermission: "ManageGuild" | "ManageEvents" | "Administrator";

    /**
     * Jak często (w sekundach) sprawdzane są w bazie konkursy,
     * których czas minął, ale z jakiegoś powodu (np. restart bota
     * w trakcie bardzo długiego konkursu) nie zostały jeszcze
     * zakończone przez zaplanowany timer.
     */
    sweepIntervalSeconds: number;

    embed: {
        activeColor: HexColorString;
        endedColor: HexColorString;
        cancelledColor: HexColorString;

        title: string;

        /**
         * {PRIZE} - nagroda
         * {WINNER_COUNT} - liczba zwycięzców
         * {HOST} - wzmianka na organizatora
         * {ENDS_RELATIVE} - znacznik czasu Discorda (relatywny)
         * {ENDS_FULL} - znacznik czasu Discorda (pełna data)
         */
        activeDescription: string;

        /**
         * {PRIZE} - nagroda
         * {WINNERS} - lista wzmianek zwycięzców (lub brak zwycięzców)
         * {HOST} - wzmianka na organizatora
         */
        endedDescription: string;
        noWinnersText: string;

        cancelledDescription: string;

        /**
         * {ID} zostanie zastąpione ID konkursu.
         */
        footer: string;
    };

    button: {
        /**
         * {COUNT} zostanie zastąpione liczbą uczestników.
         */
        joinLabel: string;
        leaveLabel: string;
        endedLabel: string;
        cancelledLabel: string;
    };

    messages: {
        joined: string;
        alreadyJoined: string;
        left: string;
        notJoined: string;
        giveawayEnded: string;
        giveawayNotFound: string;
        giveawayNotActive: string;
        giveawayNotEnded: string;
        invalidDuration: string;
        invalidWinnerCount: string;
        cannotSendToChannel: string;

        /**
         * {ID} - ID konkursu, {CHANNEL} - wzmianka na kanał.
         */
        started: string;

        /**
         * {ID} - ID konkursu.
         */
        forceStopped: string;
        cancelled: string;

        /**
         * {ID}, {TIME} - nowy relatywny znacznik czasu.
         */
        timeUpdated: string;

        /**
         * {ID}, {COUNT}
         */
        winnersUpdated: string;

        /**
         * {ID}, {COUNT} - użyte po udanym /giveaway reroll.
         */
        rerollSuccess: string;

        /**
         * Ogłoszenie w kanale po zakończeniu konkursu.
         * {PRIZE}, {WINNERS}, {ID}
         */
        announceWinners: string;
        announceNoWinners: string;

        /**
         * {PRIZE}, {WINNERS}, {ID} - użyte po /giveaway reroll.
         */
        announceReroll: string;
        rerollNoEligibleUsers: string;
    };
}

export interface CreateGiveawayInput {
    guildId: string;
    channelId: string;
    hostId: string;
    prize: string;
    winnerCount: number;
    endsAt: Date;
}
