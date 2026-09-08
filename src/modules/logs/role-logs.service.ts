import { AuditLogEvent, type Role } from "discord.js";

import { logsConfig } from "../../../config/modules/logs.config.js";
import { LOG_COLORS, LogsEmbedBuilder } from "./logs-embed.builder.js";
import { LogsService } from "./logs.service.js";

export class RoleLogsService {
    public static async logCreate(role: Role): Promise<void> {
        const entry = await LogsService.findAuditEntry(
            role.guild,
            AuditLogEvent.RoleCreate,
            role.id,
        );

        const embed = LogsEmbedBuilder.base(
            "➕ Utworzono rolę",
            LOG_COLORS.success,
        ).addFields([
            {
                name: "Rola",
                value: `${role} (\`${role.name}\`)`,
                inline: true,
            },
            {
                name: "Utworzone przez",
                value: LogsEmbedBuilder.formatModerator(entry?.executor),
                inline: true,
            },
        ]);

        await LogsService.send(
            role.guild,
            logsConfig.roles.create,
            embed,
            "utworzenie roli",
        );
    }

    public static async logDelete(role: Role): Promise<void> {
        const entry = await LogsService.findAuditEntry(
            role.guild,
            AuditLogEvent.RoleDelete,
            role.id,
        );

        const embed = LogsEmbedBuilder.base(
            "🗑️ Usunięto rolę",
            LOG_COLORS.danger,
        ).addFields([
            {
                name: "Rola",
                value: `\`${role.name}\` (${role.id})`,
                inline: true,
            },
            {
                name: "Usunięte przez",
                value: LogsEmbedBuilder.formatModerator(entry?.executor),
                inline: true,
            },
        ]);

        await LogsService.send(
            role.guild,
            logsConfig.roles.delete,
            embed,
            "usunięcie roli",
        );
    }

    public static async logUpdate(
        oldRole: Role,
        newRole: Role,
    ): Promise<void> {
        const changes = this.describeChanges(oldRole, newRole);

        if (changes.length === 0) {
            return;
        }

        const entry = await LogsService.findAuditEntry(
            newRole.guild,
            AuditLogEvent.RoleUpdate,
            newRole.id,
        );

        const embed = LogsEmbedBuilder.base(
            "🛠️ Zaktualizowano rolę",
            LOG_COLORS.info,
        ).addFields([
            {
                name: "Rola",
                value: `${newRole}`,
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
            newRole.guild,
            logsConfig.roles.update,
            embed,
            "aktualizacja roli",
        );
    }

    private static describeChanges(
        oldRole: Role,
        newRole: Role,
    ): string[] {
        const changes: string[] = [];

        if (oldRole.name !== newRole.name) {
            changes.push(
                `**Nazwa:** \`${oldRole.name}\` → \`${newRole.name}\``,
            );
        }

        if (oldRole.hexColor !== newRole.hexColor) {
            changes.push(
                `**Kolor:** \`${oldRole.hexColor}\` → \`${newRole.hexColor}\``,
            );
        }

        if (oldRole.hoist !== newRole.hoist) {
            changes.push(
                `**Wyświetlanie osobno:** ${oldRole.hoist ? "Tak" : "Nie"} → ${
                    newRole.hoist ? "Tak" : "Nie"
                }`,
            );
        }

        if (oldRole.mentionable !== newRole.mentionable) {
            changes.push(
                `**Można oznaczyć:** ${
                    oldRole.mentionable ? "Tak" : "Nie"
                } → ${newRole.mentionable ? "Tak" : "Nie"}`,
            );
        }

        if (!oldRole.permissions.equals(newRole.permissions)) {
            changes.push("**Uprawnienia:** zostały zmienione");
        }

        return changes;
    }
}
