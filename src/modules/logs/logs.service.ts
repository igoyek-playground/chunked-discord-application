import {
    PermissionFlagsBits,
    type AuditLogEvent,
    type EmbedBuilder,
    type Guild,
    type GuildAuditLogsEntry,
} from "discord.js";

import { logsConfig } from "../../../config/modules/logs.config.js";
import { logger } from "../../core/utils/logger.js";
import type { LogEventConfig } from "./logs.types.js";

export class LogsService {
    /**
     * Wysyła gotowy embed logu na kanał skonfigurowany dla danego typu
     * logu, oznaczając (ping) skonfigurowane role w treści wiadomości
     * nad embedem.
     */
    public static async send(
        guild: Guild,
        eventConfig: LogEventConfig,
        embed: EmbedBuilder,
        logLabel: string,
    ): Promise<void> {
        if (!logsConfig.enabled || !eventConfig.enabled) {
            return;
        }

        const channel = guild.channels.cache.get(
            eventConfig.channelId,
        );

        if (!channel || !channel.isTextBased()) {
            logger.warn(
                `Kanał logów "${logLabel}" (${eventConfig.channelId}) nie istnieje lub nie jest kanałem tekstowym`,
            );

            return;
        }

        const botMember = guild.members.me;

        const hasPermissions =
            !botMember ||
            channel
                .permissionsFor(botMember)
                ?.has([
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                ]);

        if (!hasPermissions) {
            logger.warn(
                `Brak uprawnień do wysłania logu "${logLabel}" na kanale ${channel.id}`,
            );

            return;
        }

        const pingContent =
            eventConfig.pingRoleIds.length > 0
                ? eventConfig.pingRoleIds
                    .map((roleId) => `<@&${roleId}>`)
                    .join(" ")
                : undefined;

        try {
            await channel.send({
                content: pingContent,
                embeds: [embed],
                allowedMentions: {
                    roles: eventConfig.pingRoleIds,
                },
            });
        } catch (error) {
            logger.error(
                `Nie udało się wysłać logu "${logLabel}":`,
                error,
            );
        }
    }

    /**
     * Odnajduje najnowszy wpis dziennika audytu danego typu, którego
     * cel (`target`) posiada wskazane ID. Zwraca `null`, jeśli nie
     * uda się pobrać dziennika (np. brak uprawnień) albo najnowszy
     * pasujący wpis jest zbyt stary, by dotyczyć bieżącego zdarzenia.
     */
    public static async findAuditEntry<Type extends AuditLogEvent>(
        guild: Guild,
        type: Type,
        targetId: string,
        maxAgeMs = 5000,
    ): Promise<GuildAuditLogsEntry<Type> | null> {
        try {
            const auditLogs = await guild.fetchAuditLogs<Type>({
                type,
                limit: 5,
            });

            const entry = auditLogs.entries.find(
                (candidate) =>
                    candidate.target !== null &&
                    typeof candidate.target === "object" &&
                    "id" in candidate.target &&
                    candidate.target.id === targetId,
            );

            if (!entry) {
                return null;
            }

            if (Date.now() - entry.createdTimestamp > maxAgeMs) {
                return null;
            }

            return entry as GuildAuditLogsEntry<Type>;
        } catch (error) {
            logger.debug(
                `Nie udało się pobrać dziennika audytu (${type}): ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );

            return null;
        }
    }
}