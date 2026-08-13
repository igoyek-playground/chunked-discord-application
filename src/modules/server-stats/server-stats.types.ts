export interface ServerStatChannelConfig {
    channelId: string;
    name: string;
}

export interface ServerStatsConfig {
    enabled: boolean;

    /**
     * Częstotliwość odświeżania statystyk w sekundach.
     */
    refreshIntervalSeconds: number;

    channels: ServerStatChannelConfig[];
}