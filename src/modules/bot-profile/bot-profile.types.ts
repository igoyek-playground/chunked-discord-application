import type {
    ActivityType,
    PresenceStatusData,
} from "discord.js";

export interface BotProfileConfig {
    username: string | null;
    avatarPath: string | null;
    bannerPath: string | null;

    applicationDescription: string | null;

    presence: {
        status: PresenceStatusData;
        afk: boolean;

        refreshIntervalSeconds: number;

        activity: {
            type: ActivityType;
            name: string;
            url?: string;
            state?: string;
        } | null;
    };
}