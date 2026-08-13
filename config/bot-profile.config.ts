import { ActivityType } from "discord.js";

import type { BotProfileConfig } from "../src/modules/bot-profile/bot-profile.types.js";

export const botProfileConfig = {
    // =========================================================================
    // PROFIL BOTA
    // =========================================================================

    /**
     * Nazwa konta Discord bota.
     *
     * Ustaw null, jeśli nazwa nie ma być zmieniana automatycznie.
     */
    username: "chunked.pl",

    /**
     * Ścieżka do avatara bota.
     *
     * Przykład:
     * "./assets/avatar.png"
     *
     * Ustaw null, aby pozostawić obecny avatar.
     */
    avatarPath: null,

    /**
     * Ścieżka do bannera bota.
     *
     * Ustaw null, aby pozostawić obecny banner.
     */
    bannerPath: null,

    /**
     * Opis aplikacji Discord.
     *
     * Ustaw null, jeśli opis nie ma być synchronizowany.
     */
    applicationDescription:
        "Oficjalny bot serwera Chunked.\nAutor aplikacji: `igoyek` <3",


    // =========================================================================
    // PRESENCE
    // =========================================================================

    presence: {
        /**
         * Status bota.
         *
         * Dostępne wartości:
         * "online"
         * "idle"
         * "dnd"
         * "invisible"
         */
        status: "idle",

        /**
         * Czy bot ma być oznaczony jako AFK.
         */
        afk: false,

        /**
         * Co ile sekund dynamiczna aktywność ma być odświeżana.
         *
         * Ustaw 0, jeśli aktywność nie ma być cyklicznie odświeżana.
         */
        refreshIntervalSeconds: 60,

        /**
         * Aktywność wyświetlana pod nazwą bota.
         *
         * Dostępne placeholdery:
         *
         * {MEMBER_COUNT} - Liczba użytkowników serwera bez botów.
         * {MEMBER_ONLINE} - Liczba użytkowników online, idle lub dnd.
         * {MEMBERS_ROLE_ID_ROLI} - Liczba użytkowników posiadających wskazaną rolę.
         * {MEMBERS_ONLINE_ROLE_ID_ROLI} - Liczba aktywnych użytkowników posiadających wskazaną rolę.
         */
        activity: {
            type: ActivityType.Watching,
            name: "{MEMBER_ONLINE} / {MEMBER_COUNT} online",
        },
    },
} satisfies BotProfileConfig;