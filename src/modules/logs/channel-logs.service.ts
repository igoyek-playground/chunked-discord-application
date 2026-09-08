import {
    AuditLogEvent,
    ChannelType,
    type DMChannel,
    type NonThreadGuildBasedChannel,
} from "discord.js";

import { logsConfig } from "../../../config/modules/logs.config.js";
import { serverStatsConfig } from "../../../config/modules/server-stats.config.js";
import { LOG_COLORS, LogsEmbedBuilder } from "./logs-embed.builder.js";
import { LogsService } from "./logs.service.js";

export class ChannelLogsService {
    public static async logCreate(
        channel: NonThreadGuildBasedChannel,
    ): Promise<void> {
        const entry = await LogsService.findAuditEntry(
            channel.guild,
            AuditLogEvent.ChannelCreate,
            channel.id,
        );

        const embed = LogsEmbedBuilder.base(
            "➕ Utworzono kanał",
            LOG_COLORS.success,
        ).addFields([
            {
                name: "Kanał",
                value: `${channel} (\`${channel.name}\`)`,
                inline: true,
            },
            {
                name: "Typ",
                value: ChannelType[channel.type],
                inline: true,
            },
            {
                name: "Utworzone przez",
                value: LogsEmbedBuilder.formatModerator(entry?.executor),
                inline: true,
            },
        ]);

        await LogsService.send(
            channel.guild,
            logsConfig.channels.create,
            embed,
            "utworzenie kanału",
        );
    }

    public static async logDelete(
        channel: DMChannel | NonThreadGuildBasedChannel,
    ): Promise<void> {
        if (!("guild" in channel) || !channel.guild) {
            return;
        }

        const entry = await LogsService.findAuditEntry(
            channel.guild,
            AuditLogEvent.ChannelDelete,
            channel.id,
        );

        const embed = LogsEmbedBuilder.base(
            "🗑️ Usunięto kanał",
            LOG_COLORS.danger,
        ).addFields([
            {
                name: "Kanał",
                value: `\`#${channel.name}\``,
                inline: true,
            },
            {
                name: "Typ",
                value: ChannelType[channel.type],
                inline: true,
            },
            {
                name: "Usunięte przez",
                value: LogsEmbedBuilder.formatModerator(entry?.executor),
                inline: true,
            },
        ]);

        await LogsService.send(
            channel.guild,
            logsConfig.channels.delete,
            embed,
            "usunięcie kanału",
        );
    }

    public static async logUpdate(
        oldChannel: DMChannel | NonThreadGuildBasedChannel,
        newChannel: DMChannel | NonThreadGuildBasedChannel,
    ): Promise<void> {
        if (!("guild" in newChannel) || !newChannel.guild) {
            return;
        }

        if (!("guild" in oldChannel)) {
            return;
        }

        if (
            logsConfig.channels.excludeStatsChannelUpdates &&
            serverStatsConfig.channels.some(
                (statChannel) => statChannel.channelId === newChannel.id,
            )
        ) {
            return;
        }

        const changes = this.describeChanges(oldChannel, newChannel);

        if (changes.length === 0) {
            return;
        }

        const entry = await LogsService.findAuditEntry(
            newChannel.guild,
            AuditLogEvent.ChannelUpdate,
            newChannel.id,
        );

        const embed = LogsEmbedBuilder.base(
            "🛠️ Zaktualizowano kanał",
            LOG_COLORS.info,
        ).addFields([
            {
                name: "Kanał",
                value: `${newChannel}`,
                inline: true,
            },
            {
                name: "Zmienione przez",
                value: LogsEmbedBuilder.formatModerator(entry?.executor),
                inline: true,
            },
            {
                name: "Zmiany",
                value: LogsEmbedBuilder.truncate(changes.join("\n")),
            },
        ]);

        await LogsService.send(
            newChannel.guild,
            logsConfig.channels.update,
            embed,
            "aktualizacja kanału",
        );
    }

    private static describeChanges(
        oldChannel: NonThreadGuildBasedChannel,
        newChannel: NonThreadGuildBasedChannel,
    ): string[] {
        const changes: string[] = [];

        if (oldChannel.name !== newChannel.name) {
            changes.push(
                `**Nazwa:** \`${oldChannel.name}\` → \`${newChannel.name}\``,
            );
        }

        if (
            "topic" in oldChannel &&
            "topic" in newChannel &&
            oldChannel.topic !== newChannel.topic
        ) {
            changes.push(
                `**Temat:** ${
                    oldChannel.topic ? `\`${oldChannel.topic}\`` : "*brak*"
                } → ${
                    newChannel.topic ? `\`${newChannel.topic}\`` : "*brak*"
                }`,
            );
        }

        if (
            "nsfw" in oldChannel &&
            "nsfw" in newChannel &&
            oldChannel.nsfw !== newChannel.nsfw
        ) {
            changes.push(
                `**NSFW:** ${oldChannel.nsfw ? "Tak" : "Nie"} → ${
                    newChannel.nsfw ? "Tak" : "Nie"
                }`,
            );
        }

        if (
            "rateLimitPerUser" in oldChannel &&
            "rateLimitPerUser" in newChannel &&
            oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser
        ) {
            changes.push(
                `**Spowolnienie:** ${oldChannel.rateLimitPerUser ?? 0}s → ${
                    newChannel.rateLimitPerUser ?? 0
                }s`,
            );
        }

        if (oldChannel.parentId !== newChannel.parentId) {
            changes.push(
                `**Kategoria:** ${
                    oldChannel.parent ? `\`${oldChannel.parent.name}\`` : "*brak*"
                } → ${
                    newChannel.parent ? `\`${newChannel.parent.name}\`` : "*brak*"
                }`,
            );
        }

        return changes;
    }
}