import {
    EmbedBuilder,
    resolveColor,
    type APIEmbedField,
    type HexColorString,
} from "discord.js";

import type { Bot } from "../../../core/bot.js";

import {
    formatBytes,
    formatDuration,
} from "../../../core/utils/format.js";
import type { BotInfoStats } from "./bot-info.service.js";

const EMBED_COLOR: HexColorString = "#5865F2";

export interface BotInfoPings {
    gatewayMs: number;
    restMs: number;
}

export class BotInfoEmbedBuilder {
    public static build(
        bot: Bot,
        stats: BotInfoStats,
        pings: BotInfoPings,
        requestedByTag: string,
    ): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(resolveColor(EMBED_COLOR))
            .setAuthor({
                name: `${bot.user?.username ?? "Bot"} — informacje`,
                iconURL: bot.user?.displayAvatarURL(),
            })
            .setThumbnail(
                bot.user?.displayAvatarURL({ size: 256 }) ??
                    null,
            )
            .addFields(
                this.header("📋 Ogólne"),
                {
                    name: "Wersja",
                    value: `\`${stats.version}\``,
                    inline: true,
                },
                {
                    name: "Działa od",
                    value: formatDuration(stats.uptimeMs),
                    inline: true,
                },
                {
                    name: "ID aplikacji",
                    value: `\`${bot.user?.id ?? "?"}\``,
                    inline: true,
                },

                this.header("🌐 Statystyki"),
                {
                    name: "Serwery",
                    value: stats.guildCount.toLocaleString(
                        "pl-PL",
                    ),
                    inline: true,
                },
                {
                    name: "Użytkownicy",
                    value: stats.userCount.toLocaleString(
                        "pl-PL",
                    ),
                    inline: true,
                },
                {
                    name: "Kanały",
                    value: stats.channelCount.toLocaleString(
                        "pl-PL",
                    ),
                    inline: true,
                },
                {
                    name: "Komendy",
                    value: stats.commandCount.toLocaleString(
                        "pl-PL",
                    ),
                    inline: true,
                },

                this.header("📶 Wydajność"),
                {
                    name: "Gateway Ping",
                    value: `${pings.gatewayMs} ms`,
                    inline: true,
                },
                {
                    name: "REST Ping",
                    value: `${pings.restMs} ms`,
                    inline: true,
                },
                {
                    name: "Pamięć procesu",
                    value: formatBytes(
                        stats.processMemoryBytes,
                    ),
                    inline: true,
                },
                {
                    name: "Heap (JS)",
                    value:
                        `${formatBytes(stats.heapUsedBytes)} / ` +
                        formatBytes(stats.heapTotalBytes),
                    inline: true,
                },

                this.header("🖥️ Maszyna"),
                {
                    name: "System",
                    value: `${stats.osType} ${stats.osRelease}`,
                    inline: true,
                },
                {
                    name: "Architektura",
                    value: stats.osArch,
                    inline: true,
                },
                {
                    name: "CPU",
                    value: `${stats.cpuModel} (${stats.cpuCoreCount} rdzeni)`,
                    inline: true,
                },
                {
                    name: "RAM (system)",
                    value:
                        `${formatBytes(stats.systemMemoryUsedBytes)} / ` +
                        formatBytes(
                            stats.systemMemoryTotalBytes,
                        ),
                    inline: true,
                },
                {
                    name: "Node.js",
                    value: stats.nodeVersion,
                    inline: true,
                },
                {
                    name: "discord.js",
                    value: `v${stats.discordJsVersion}`,
                    inline: true,
                },
            )
            .setFooter({
                text: `Poproszone przez ${requestedByTag}`,
            })
            .setTimestamp();
    }

    private static header(title: string): APIEmbedField {
        return {
            name: "\u200B",
            value: `**${title}**`,
            inline: false,
        };
    }
}