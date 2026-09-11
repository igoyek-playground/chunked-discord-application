import type { GiveawayConfig } from "../../src/modules/giveaway/giveaway.types.js";

export const giveawayConfig = {
    // =========================================================================
    // UPRAWNIENIA
    // =========================================================================

    /**
     * Uprawnienie wymagane do zarządzania konkursami (wszystkie
     * subkomendy poza samym dołączaniem/rezygnacją przyciskiem).
     */
    managePermission: "ManageGuild",


    // =========================================================================
    // SWEEP
    // =========================================================================

    /**
     * Co ile sekund bot sprawdza w bazie, czy jakiś aktywny konkurs
     * nie powinien zostać już zakończony (siatka bezpieczeństwa —
     * dogrywa konkursy dłuższe niż limit setTimeout oraz te, które
     * "przegapiły" zakończenie w trakcie restartu/przestoju bota).
     */
    sweepIntervalSeconds: 30,


    // =========================================================================
    // EMBED
    // =========================================================================

    embed: {
        activeColor: "#5865F2",
        endedColor: "#2ECC71",
        cancelledColor: "#ED4245",

        title: "🎉 Konkurs!",

        activeDescription:
            "Nagroda: **{PRIZE}**\n" +
            "Liczba zwycięzców: **{WINNER_COUNT}**\n" +
            "Organizator: {HOST}\n\n" +
            "Koniec: {ENDS_RELATIVE} ({ENDS_FULL})",

        endedDescription:
            "Nagroda: **{PRIZE}**\n" +
            "Organizator: {HOST}\n\n" +
            "Zwycięzcy: {WINNERS}",

        noWinnersText: "Brak zwycięzców — nikt nie dołączył do konkursu.",

        cancelledDescription:
            "Nagroda: **{PRIZE}**\n\n" +
            "Ten konkurs został anulowany.",

        /**
         * {ID} zostanie zastąpione ID konkursu.
         */
        footer: "ID konkursu: {ID}",
    },


    // =========================================================================
    // PRZYCISKI
    // =========================================================================

    button: {
        /**
         * {COUNT} zostanie zastąpione liczbą uczestników.
         */
        joinLabel: "{COUNT} osób bierze udział",
        leaveLabel: "Zrezygnuj z udziału",
        endedLabel: "Konkurs zakończony",
        cancelledLabel: "Konkurs anulowany",
    },


    // =========================================================================
    // WIADOMOŚCI
    // =========================================================================

    messages: {
        joined: "🎉 Dołączono do konkursu!",
        alreadyJoined:
            "Już bierzesz udział w tym konkursie.",
        left: "Zrezygnowano z udziału w konkursie.",
        notJoined:
            "Nie bierzesz udziału w tym konkursie.",
        giveawayEnded:
            "Ten konkurs już się zakończył.",
        giveawayNotFound:
            "Nie znaleziono konkursu o podanym ID.",
        giveawayNotActive:
            "Ten konkurs nie jest już aktywny.",
        giveawayNotEnded:
            "Reroll można wykonać tylko dla zakończonego konkursu.",
        invalidDuration:
            "Niepoprawny format czasu. Przykłady: `30m`, `2h`, `1d`, `1d12h`.",
        invalidWinnerCount:
            "Liczba zwycięzców musi być liczbą całkowitą większą od 0.",
        cannotSendToChannel:
            "Nie można wysłać konkursu na tym kanale.",

        started:
            "🎉 Konkurs `{ID}` został utworzony na kanale {CHANNEL}.",
        forceStopped:
            "Konkurs `{ID}` został zakończony.",
        cancelled: "Konkurs `{ID}` został anulowany.",
        timeUpdated:
            "Czas zakończenia konkursu `{ID}` został zaktualizowany. Nowy koniec: {TIME}.",
        winnersUpdated:
            "Zaktualizowano konkurs `{ID}` — liczba zwycięzców: {COUNT}.",
        rerollSuccess:
            "Wylosowano {COUNT} dodatkowych zwycięzców dla konkursu `{ID}`.",

        announceWinners:
            "🎉 Gratulacje {WINNERS}! Wygrywacie **{PRIZE}** (konkurs `{ID}`).",
        announceNoWinners:
            "Konkurs na **{PRIZE}** (`{ID}`) zakończył się bez zwycięzców — nikt nie wziął udziału.",
        announceReroll:
            "🎉 Reroll konkursu `{ID}`! Dodatkowi zwycięzcy: {WINNERS} — gratulacje, wygrywacie **{PRIZE}**!",
        rerollNoEligibleUsers:
            "Brak wystarczającej liczby uczestników do wylosowania dodatkowych zwycięzców.",
    },
} satisfies GiveawayConfig;
