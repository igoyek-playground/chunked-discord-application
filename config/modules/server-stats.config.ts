import type { ServerStatsConfig } from "../../src/modules/server-stats/server-stats.types.js";

export const serverStatsConfig = {
    // =========================================================================
    // STATYSTYKI SERWERA
    // =========================================================================

    /**
     * Włącza lub wyłącza cały moduł statystyk.
     */
    enabled: true,

    /**
     * Częstotliwość odświeżania nazw kanałów w sekundach.
     *
     * Przykład:
     * 60  = co minutę
     * 300 = co 5 minut
     *
     * Nie ustawiaj bardzo małych wartości.
     * Zmiana nazwy kanału wykonuje request do Discord API i podlega
     * ograniczeniom rate limit.
     */
    refreshIntervalSeconds: 120,

    /**
     * Kanały głosowe używane jako statystyki.
     *
     * Każdy wpis zawiera:
     * channelId - ID kanału głosowego
     * name      - wzór jego nazwy
     *
     * Dostępne placeholdery:
     *
     * {MEMBER_COUNT} - Liczba użytkowników serwera bez botów.
     * {MEMBER_ONLINE} - Liczba użytkowników ze statusem online, idle lub dnd.
     * {MEMBERS_ROLE_ID_ROLI} - Liczba użytkowników posiadających wskazaną rolę.
     * {MEMBERS_ONLINE_ROLE_ID_ROLI} - Liczba aktywnych użytkowników posiadających wskazaną rolę.
     */
    channels: [
        {
            channelId: "1537404642445496350",
            name: "👥 Użytkownicy: {MEMBER_COUNT}",
        },
        {
            channelId: "1537404661332447272",
            name: "🟢 Online: {MEMBER_ONLINE}",
        },
        {
            channelId: "0",
            name: "⭐ Administracja: {MEMBERS_ROLE_123456789012345678}",
        },
        {
            channelId: "0",
            name: "🟢 Administracja online: {MEMBERS_ONLINE_ROLE_123456789012345678}",
        },
    ],
} satisfies ServerStatsConfig;