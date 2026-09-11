import type { LogsConfig } from "../../src/modules/logs/logs.types.js";

export const logsConfig = {
    // =========================================================================
    // GŁÓWNY WYŁĄCZNIK
    // =========================================================================

    /**
     * Wyłączenie tego przełącznika wyłącza CAŁY moduł logów,
     * niezależnie od ustawień poniżej.
     */
    enabled: true,


    // =========================================================================
    // WIADOMOŚCI
    // =========================================================================

    messages: {
        /**
         * Usunięcie pojedynczej wiadomości.
         */
        delete: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: ["1543268489333055650"],
        },

        /**
         * Masowe usunięcie wiadomości (np. komendą /clear).
         */
        bulkDelete: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Edycja treści wiadomości.
         */
        edit: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },
    },


    // =========================================================================
    // CZŁONKOWIE
    // =========================================================================

    members: {
        /**
         * Dołączenie nowego użytkownika do serwera.
         */
        join: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Samodzielne opuszczenie serwera przez użytkownika.
         *
         * Jeśli opuszczenie serwera zostało wykryte jako wyrzucenie
         * (kick), wysyłany jest zamiast tego log `members.kick`.
         */
        leave: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Wyrzucenie użytkownika z serwera (kick).
         */
        kick: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Zbanowanie użytkownika.
         */
        ban: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Zdjęcie bana z użytkownika.
         */
        unban: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Nałożenie lub zdjęcie wyciszenia czasowego (timeout).
         */
        timeout: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Zmiana pseudonimu (nicku) na serwerze.
         */
        nicknameUpdate: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Nadanie roli użytkownikowi.
         *
         * Nadanie roli weryfikacyjnej (zob. `verifiedRoleId` w
         * konfiguracji modułu weryfikacji) NIE trafia tutaj — jest
         * ono raportowane osobno w `members.verified`, aby uniknąć
         * zdublowania wpisu.
         */
        roleAdd: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Odebranie roli użytkownikowi.
         */
        roleRemove: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Pomyślna weryfikacja użytkownika (samodzielna lub ręczna).
         */
        verified: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },
    },


    // =========================================================================
    // KANAŁY GŁOSOWE
    // =========================================================================

    voice: {
        /**
         * Dołączenie do kanału głosowego.
         */
        join: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Opuszczenie kanału głosowego.
         */
        leave: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Przeniesienie się między kanałami głosowymi.
         */
        move: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Wyciszenie lub zdjęcie wyciszenia przez serwer (moderację).
         *
         * Nie dotyczy samodzielnego wyciszenia mikrofonu przez
         * użytkownika.
         */
        muteUpdate: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Ogłuszenie lub zdjęcie ogłuszenia przez serwer (moderację).
         *
         * Nie dotyczy samodzielnego ogłuszenia się przez użytkownika.
         */
        deafenUpdate: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },
    },


    // =========================================================================
    // KANAŁY (TEKSTOWE / GŁOSOWE / KATEGORIE)
    // =========================================================================

    channels: {
        /**
         * Utworzenie nowego kanału.
         */
        create: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Usunięcie kanału.
         */
        delete: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Zmiana kanału: nazwy, tematu, NSFW, spowolnienia lub kategorii.
         */
        update: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Domyślnie true — moduł statystyk serwera (server-stats)
         * cyklicznie zmienia nazwy swoich kanałów, więc ich
         * aktualizacje są tu pomijane, żeby nie zaśmiecać logu.
         *
         * Ustaw false, jeśli mimo to chcesz je widzieć.
         */
        excludeStatsChannelUpdates: true,
    },


    // =========================================================================
    // ROLE
    // =========================================================================

    roles: {
        /**
         * Utworzenie nowej roli.
         */
        create: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Usunięcie roli.
         */
        delete: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Zmiana roli: nazwy, koloru, uprawnień, widoczności lub
         * możliwości oznaczenia.
         */
        update: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },
    },


    // =========================================================================
    // SERWER
    // =========================================================================

    server: {
        /**
         * Zmiana ustawień serwera: nazwy, ikony, banera lub linku
         * vanity.
         */
        update: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Utworzenie zaproszenia.
         */
        inviteCreate: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },

        /**
         * Usunięcie lub wygaśnięcie zaproszenia.
         */
        inviteDelete: {
            enabled: true,
            channelId: "1416378667721818132",
            pingRoleIds: [],
        },
    },
} satisfies LogsConfig;