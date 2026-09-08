/**
 * Konfiguracja pojedynczego typu logu.
 */
export interface LogEventConfig {
    /**
     * Włącza lub wyłącza wysyłanie tego konkretnego logu.
     */
    enabled: boolean;

    /**
     * ID kanału, na który mają trafiać te logi.
     */
    channelId: string;

    /**
     * ID ról, które mają zostać oznaczone (ping) nad embedem z logiem.
     *
     * Pusta tablica = brak oznaczenia.
     */
    pingRoleIds: string[];
}

export interface LogsConfig {
    /**
     * Główny wyłącznik całego modułu logów.
     */
    enabled: boolean;

    messages: {
        delete: LogEventConfig;
        bulkDelete: LogEventConfig;
        edit: LogEventConfig;
    };

    members: {
        join: LogEventConfig;
        leave: LogEventConfig;
        kick: LogEventConfig;
        ban: LogEventConfig;
        unban: LogEventConfig;
        timeout: LogEventConfig;
        nicknameUpdate: LogEventConfig;
        roleAdd: LogEventConfig;
        roleRemove: LogEventConfig;

        /**
         * Log wysyłany po pomyślnej weryfikacji użytkownika.
         *
         * Nadanie roli weryfikacyjnej NIE trafia dodatkowo do
         * `members.roleAdd` — pozwala to uniknąć zdublowania wpisu.
         */
        verified: LogEventConfig;
    };

    voice: {
        join: LogEventConfig;
        leave: LogEventConfig;
        move: LogEventConfig;

        /**
         * Wyciszenie/zdjęcie wyciszenia przez serwer (moderację),
         * nie samodzielne wyciszenie mikrofonu przez użytkownika.
         */
        muteUpdate: LogEventConfig;

        /**
         * Ogłuszenie/zdjęcie ogłuszenia przez serwer (moderację),
         * nie samodzielne ogłuszenie przez użytkownika.
         */
        deafenUpdate: LogEventConfig;
    };

    channels: {
        create: LogEventConfig;
        delete: LogEventConfig;
        update: LogEventConfig;

        /**
         * Gdy true, zmiany kanałów używanych przez moduł statystyk
         * serwera (server-stats — zob. `serverStatsConfig.channels`)
         * NIE trafiają do `channels.update`.
         *
         * Moduł statystyk cyklicznie zmienia nazwy tych kanałów,
         * więc bez tej opcji log `channels.update` byłby zalewany
         * takimi wpisami.
         */
        excludeStatsChannelUpdates: boolean;
    };

    roles: {
        create: LogEventConfig;
        delete: LogEventConfig;
        update: LogEventConfig;
    };

    server: {
        update: LogEventConfig;
        inviteCreate: LogEventConfig;
        inviteDelete: LogEventConfig;
    };
}