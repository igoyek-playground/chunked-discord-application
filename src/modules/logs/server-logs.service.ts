import { AuditLogEvent, Guild, type Invite } from "discord.js";

import { logsConfig } from "../../../config/modules/logs.config.js";
import { LOG_COLORS, LogsEmbedBuilder } from "./logs-embed.builder.js";
import { LogsService } from "./logs.service.js";

export class ServerLogsService {
    public static async logGuildUpdate(
        oldGuild: Guild,
        newGuild: Guild,
    ): Promise<void> {
        const changes = this.describeChanges(oldGuild, newGuild);

        if (changes.length === 0) {
            return;
        }

        const entry = await LogsService.findAuditEntry(
            newGuild,
            AuditLogEvent.GuildUpdate,
            newGuild.id,
        );

        const embed = LogsEmbedBuilder.base(
            "🏠 Zaktualizowano serwer",
            LOG_COLORS.info,
        ).addFields([
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

        const iconUrl = newGuild.iconURL();

        if (iconUrl) {
            embed.setThumbnail(iconUrl);
        }

        await LogsService.send(
            newGuild,
            logsConfig.server.update,
            embed,
            "aktualizacja serwera",
        );
    }

    public static async logInviteCreate(invite: Invite): Promise<void> {
        if (!(invite.guild instanceof Guild)) {
            return;
        }

        const embed = LogsEmbedBuilder.base(
            "🔗 Utworzono zaproszenie",
            LOG_COLORS.success,
        ).addFields([
            {
                name: "Kod",
                value: `\`${invite.code}\``,
                inline: true,
            },
            {
                name: "Kanał",
                value: invite.channel ? `${invite.channel}` : "Nieznany",
                inline: true,
            },
            {
                name: "Utworzone przez",
                value: invite.inviter
                    ? LogsEmbedBuilder.formatUser(invite.inviter)
                    : "Nieznany",
                inline: true,
            },
            {
                name: "Maksymalna liczba użyć",
                value: invite.maxUses ? `${invite.maxUses}` : "Bez limitu",
                inline: true,
            },
            {
                name: "Wygasa",
                value: invite.expiresTimestamp
                    ? `<t:${Math.floor(invite.expiresTimestamp / 1000)}:R>`
                    : "Nigdy",
                inline: true,
            },
        ]);

        await LogsService.send(
            invite.guild,
            logsConfig.server.inviteCreate,
            embed,
            "utworzenie zaproszenia",
        );
    }

    public static async logInviteDelete(invite: Invite): Promise<void> {
        if (!(invite.guild instanceof Guild)) {
            return;
        }

        const executor = await this.resolveInviteDeleteExecutor(
            invite.guild,
            invite.code,
        );

        const embed = LogsEmbedBuilder.base(
            "✂️ Usunięto zaproszenie",
            LOG_COLORS.warning,
        ).addFields([
            {
                name: "Kod",
                value: `\`${invite.code}\``,
                inline: true,
            },
            {
                name: "Kanał",
                value: invite.channel ? `${invite.channel}` : "Nieznany",
                inline: true,
            },
            {
                name: "Usunięte przez",
                value: LogsEmbedBuilder.formatModerator(executor),
                inline: true,
            },
        ]);

        await LogsService.send(
            invite.guild,
            logsConfig.server.inviteDelete,
            embed,
            "usunięcie zaproszenia",
        );
    }

    /**
     * Wpisy dziennika audytu dla zaproszeń mają cel (`target`) typu
     * `Invite`, identyfikowany kodem, a nie ID — dlatego nie można
     * tu użyć generycznego `LogsService.findAuditEntry`.
     */
    private static async resolveInviteDeleteExecutor(
        guild: Guild,
        code: string,
    ) {
        try {
            const auditLogs = await guild.fetchAuditLogs({
                type: AuditLogEvent.InviteDelete,
                limit: 5,
            });

            const entry = auditLogs.entries.find(
                (candidate) => candidate.target?.code === code,
            );

            if (!entry || Date.now() - entry.createdTimestamp > 5000) {
                return null;
            }

            return entry.executor;
        } catch {
            return null;
        }
    }

    private static describeChanges(
        oldGuild: Guild,
        newGuild: Guild,
    ): string[] {
        const changes: string[] = [];

        if (oldGuild.name !== newGuild.name) {
            changes.push(
                `**Nazwa:** \`${oldGuild.name}\` → \`${newGuild.name}\``,
            );
        }

        if (oldGuild.iconURL() !== newGuild.iconURL()) {
            changes.push("**Ikona serwera:** została zmieniona");
        }

        if (oldGuild.bannerURL() !== newGuild.bannerURL()) {
            changes.push("**Baner serwera:** został zmieniony");
        }

        if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
            changes.push(
                `**Link vanity:** \`${
                    oldGuild.vanityURLCode ?? "brak"
                }\` → \`${newGuild.vanityURLCode ?? "brak"}\``,
            );
        }

        return changes;
    }
}
