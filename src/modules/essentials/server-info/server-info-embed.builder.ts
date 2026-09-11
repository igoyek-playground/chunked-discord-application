import {
    EmbedBuilder,
    resolveColor,
    type APIEmbedField,
    type HexColorString,
} from "discord.js";

import type { ServerInfoStats } from "./server-info.service.js";

const EMBED_COLOR: HexColorString = "#5865F2";

export class ServerInfoEmbedBuilder {
    public static build(
        stats: ServerInfoStats,
        requestedByTag: string,
    ): EmbedBuilder {
        const createdSeconds = Math.floor(
            stats.createdTimestamp / 1000,
        );

        const embed = new EmbedBuilder()
            .setColor(resolveColor(EMBED_COLOR))
            .setAuthor({
                name: stats.name,
                iconURL: stats.iconUrl ?? undefined,
            })
            .setThumbnail(stats.iconUrl)
            .addFields(
                this.header("📋 Ogólne"),
                {
                    name: "Właściciel",
                    value: `<@${stats.ownerId}>`,
                    inline: true,
                },
                {
                    name: "Utworzono",
                    value: `<t:${createdSeconds}:D> (<t:${createdSeconds}:R>)`,
                    inline: true,
                },
                {
                    name: "ID serwera",
                    value: `\`${stats.id}\``,
                    inline: true,
                },

                this.header("👥 Członkowie"),
                {
                    name: "Łącznie",
                    value: stats.memberCountTotal.toLocaleString(
                        "pl-PL",
                    ),
                    inline: true,
                },
                {
                    name: "Użytkownicy",
                    value: stats.memberCountHumans.toLocaleString(
                        "pl-PL",
                    ),
                    inline: true,
                },
                {
                    name: "Boty",
                    value: stats.memberCountBots.toLocaleString(
                        "pl-PL",
                    ),
                    inline: true,
                },
                {
                    name: "Online",
                    value: stats.memberCountOnline.toLocaleString(
                        "pl-PL",
                    ),
                    inline: true,
                },

                this.header("💬 Kanały"),
                {
                    name: "Tekstowe",
                    value: stats.channelCountText.toString(),
                    inline: true,
                },
                {
                    name: "Głosowe",
                    value: stats.channelCountVoice.toString(),
                    inline: true,
                },
                {
                    name: "Kategorie",
                    value: stats.channelCountCategory.toString(),
                    inline: true,
                },
                {
                    name: "Wątki",
                    value: stats.channelCountThreads.toString(),
                    inline: true,
                },

                this.header("🎭 Role i zawartość"),
                {
                    name: "Role",
                    value: stats.roleCount.toString(),
                    inline: true,
                },
                {
                    name: "Emoji",
                    value: stats.emojiCount.toString(),
                    inline: true,
                },
                {
                    name: "Naklejki",
                    value: stats.stickerCount.toString(),
                    inline: true,
                },

                this.header("🚀 Boost i bezpieczeństwo"),
                {
                    name: "Poziom boost",
                    value: stats.boostTierLabel,
                    inline: true,
                },
                {
                    name: "Liczba boostów",
                    value: stats.boostCount.toString(),
                    inline: true,
                },
                {
                    name: "Weryfikacja",
                    value: stats.verificationLevelLabel,
                    inline: true,
                },
                {
                    name: "Filtr treści",
                    value: stats.explicitContentFilterLabel,
                    inline: true,
                },
                {
                    name: "2FA dla moderacji",
                    value: stats.mfaLevelLabel,
                    inline: true,
                },
                {
                    name: "Język serwera",
                    value: stats.preferredLocale,
                    inline: true,
                },
            )
            .setFooter({
                text: stats.memberCacheComplete
                    ? `Wywołane przez ${requestedByTag}`
                    : `Wywołane przez ${requestedByTag} • dane o członkach mogą być przybliżone`,
            })
            .setTimestamp();

        if (stats.bannerUrl) {
            embed.setImage(stats.bannerUrl);
        }

        return embed;
    }

    private static header(title: string): APIEmbedField {
        return {
            name: "\u200B",
            value: `**${title}**`,
            inline: false,
        };
    }
}