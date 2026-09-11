import {
    ChannelType,
    GuildExplicitContentFilter,
    GuildMFALevel,
    GuildPremiumTier,
    GuildVerificationLevel,
    type Guild,
} from "discord.js";

export interface ServerInfoStats {
    name: string;
    id: string;
    ownerId: string;
    createdTimestamp: number;
    iconUrl: string | null;
    bannerUrl: string | null;
    preferredLocale: string;

    memberCountTotal: number;
    memberCountHumans: number;
    memberCountBots: number;
    memberCountOnline: number;
    memberCacheComplete: boolean;

    channelCountTotal: number;
    channelCountText: number;
    channelCountVoice: number;
    channelCountCategory: number;
    channelCountThreads: number;

    roleCount: number;
    emojiCount: number;
    stickerCount: number;

    boostTierLabel: string;
    boostCount: number;

    verificationLevelLabel: string;
    explicitContentFilterLabel: string;
    mfaLevelLabel: string;
}

const TEXT_CHANNEL_TYPES: ReadonlySet<ChannelType> = new Set([
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
]);

const VOICE_CHANNEL_TYPES: ReadonlySet<ChannelType> = new Set([
    ChannelType.GuildVoice,
    ChannelType.GuildStageVoice,
]);

const THREAD_CHANNEL_TYPES: ReadonlySet<ChannelType> = new Set([
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
    ChannelType.AnnouncementThread,
]);

export class ServerInfoService {
    public static collect(guild: Guild): ServerInfoStats {
        const channels = [...guild.channels.cache.values()];

        const members = [...guild.members.cache.values()];
        const memberCacheComplete =
            members.length >= guild.memberCount;

        return {
            name: guild.name,
            id: guild.id,
            ownerId: guild.ownerId,
            createdTimestamp: guild.createdTimestamp,
            iconUrl: guild.iconURL({ size: 256 }),
            bannerUrl: guild.bannerURL({ size: 1024 }),
            preferredLocale: guild.preferredLocale,

            memberCountTotal: guild.memberCount,
            memberCountHumans: members.filter(
                (member) => !member.user.bot,
            ).length,
            memberCountBots: members.filter(
                (member) => member.user.bot,
            ).length,
            memberCountOnline: members.filter(
                (member) => this.isOnline(member.presence?.status),
            ).length,
            memberCacheComplete,

            channelCountTotal: channels.length,
            channelCountText: channels.filter((channel) =>
                TEXT_CHANNEL_TYPES.has(channel.type),
            ).length,
            channelCountVoice: channels.filter((channel) =>
                VOICE_CHANNEL_TYPES.has(channel.type),
            ).length,
            channelCountCategory: channels.filter(
                (channel) =>
                    channel.type === ChannelType.GuildCategory,
            ).length,
            channelCountThreads: channels.filter((channel) =>
                THREAD_CHANNEL_TYPES.has(channel.type),
            ).length,

            roleCount: guild.roles.cache.size - 1, // bez @everyone
            emojiCount: guild.emojis.cache.size,
            stickerCount: guild.stickers.cache.size,

            boostTierLabel: this.mapBoostTier(
                guild.premiumTier,
            ),
            boostCount: guild.premiumSubscriptionCount ?? 0,

            verificationLevelLabel:
                this.mapVerificationLevel(
                    guild.verificationLevel,
                ),
            explicitContentFilterLabel:
                this.mapExplicitContentFilter(
                    guild.explicitContentFilter,
                ),
            mfaLevelLabel: this.mapMfaLevel(guild.mfaLevel),
        };
    }

    private static isOnline(
        status: string | undefined,
    ): boolean {
        return (
            status === "online" ||
            status === "idle" ||
            status === "dnd"
        );
    }

    private static mapBoostTier(
        tier: GuildPremiumTier,
    ): string {
        switch (tier) {
            case GuildPremiumTier.Tier1:
                return "Poziom 1";
            case GuildPremiumTier.Tier2:
                return "Poziom 2";
            case GuildPremiumTier.Tier3:
                return "Poziom 3";
            default:
                return "Brak";
        }
    }

    private static mapVerificationLevel(
        level: GuildVerificationLevel,
    ): string {
        switch (level) {
            case GuildVerificationLevel.None:
                return "Brak";
            case GuildVerificationLevel.Low:
                return "Niski";
            case GuildVerificationLevel.Medium:
                return "Średni";
            case GuildVerificationLevel.High:
                return "Wysoki";
            case GuildVerificationLevel.VeryHigh:
                return "Bardzo wysoki";
            default:
                return "Nieznany";
        }
    }

    private static mapExplicitContentFilter(
        filter: GuildExplicitContentFilter,
    ): string {
        switch (filter) {
            case GuildExplicitContentFilter.Disabled:
                return "Wyłączony";
            case GuildExplicitContentFilter.MembersWithoutRoles:
                return "Osoby bez ról";
            case GuildExplicitContentFilter.AllMembers:
                return "Wszyscy";
            default:
                return "Nieznany";
        }
    }

    private static mapMfaLevel(
        level: GuildMFALevel,
    ): string {
        return level === GuildMFALevel.Elevated
            ? "Wymagane"
            : "Brak";
    }
}