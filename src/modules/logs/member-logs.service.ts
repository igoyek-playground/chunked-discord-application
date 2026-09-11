import {
    AuditLogEvent,
    type Guild,
    type GuildBan,
    type GuildMember,
    type PartialGuildMember,
    type PartialUser,
    type User,
} from "discord.js";

import { logsConfig } from "../../../config/modules/logs.config.js";
import { verificationConfig } from "../../../config/modules/verification.config.js";
import { LOG_COLORS, LogsEmbedBuilder } from "./logs-embed.builder.js";
import { LogsService } from "./logs.service.js";

const NEW_ACCOUNT_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 7;

export class MemberLogsService {
    public static async logJoin(member: GuildMember): Promise<void> {
        const isNewAccount =
            Date.now() - member.user.createdTimestamp <
            NEW_ACCOUNT_THRESHOLD_MS;

        const embed = LogsEmbedBuilder.base(
            "📥 Nowy użytkownik dołączył",
            LOG_COLORS.success,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatMember(member),
                inline: true,
            },
            {
                name: "Konto utworzono",
                value:
                    `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` +
                    (isNewAccount ? " ⚠️ Nowe konto" : ""),
                inline: true,
            },
            {
                name: "Liczba członków",
                value: `${member.guild.memberCount}`,
                inline: true,
            },
        ]);

        LogsEmbedBuilder.withUserFooter(embed, member.user);

        await LogsService.send(
            member.guild,
            logsConfig.members.join,
            embed,
            "dołączenie użytkownika",
        );
    }

    public static async logLeaveOrKick(
        member: GuildMember | PartialGuildMember,
    ): Promise<void> {
        const kickEntry = await LogsService.findAuditEntry(
            member.guild,
            AuditLogEvent.MemberKick,
            member.id,
        );

        if (kickEntry) {
            await this.logKick(
                member,
                kickEntry.executor,
                kickEntry.reason,
            );

            return;
        }

        const embed = LogsEmbedBuilder.base(
            "📤 Użytkownik opuścił serwer",
            LOG_COLORS.neutral,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatUser(member.user),
                inline: true,
            },
            {
                name: "Dołączył",
                value: member.joinedTimestamp
                    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
                    : "Nieznane",
                inline: true,
            },
        ]);

        LogsEmbedBuilder.withUserFooter(embed, member.user);

        await LogsService.send(
            member.guild,
            logsConfig.members.leave,
            embed,
            "opuszczenie serwera",
        );
    }

    public static async logBan(ban: GuildBan): Promise<void> {
        const entry = await LogsService.findAuditEntry(
            ban.guild,
            AuditLogEvent.MemberBanAdd,
            ban.user.id,
        );

        const embed = LogsEmbedBuilder.base(
            "🔨 Zbanowano użytkownika",
            LOG_COLORS.danger,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatUser(ban.user),
                inline: true,
            },
            {
                name: "Moderator",
                value: LogsEmbedBuilder.formatModerator(entry?.executor),
                inline: true,
            },
            {
                name: "Powód",
                value: entry?.reason ?? ban.reason ?? "Nie podano powodu",
            },
        ]);

        LogsEmbedBuilder.withUserFooter(embed, ban.user);

        await LogsService.send(
            ban.guild,
            logsConfig.members.ban,
            embed,
            "zbanowanie użytkownika",
        );
    }

    public static async logUnban(ban: GuildBan): Promise<void> {
        const entry = await LogsService.findAuditEntry(
            ban.guild,
            AuditLogEvent.MemberBanRemove,
            ban.user.id,
        );

        const embed = LogsEmbedBuilder.base(
            "🔓 Odbanowano użytkownika",
            LOG_COLORS.info,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatUser(ban.user),
                inline: true,
            },
            {
                name: "Moderator",
                value: LogsEmbedBuilder.formatModerator(entry?.executor),
                inline: true,
            },
        ]);

        LogsEmbedBuilder.withUserFooter(embed, ban.user);

        await LogsService.send(
            ban.guild,
            logsConfig.members.unban,
            embed,
            "odbanowanie użytkownika",
        );
    }

    public static async logMemberUpdate(
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember,
    ): Promise<void> {
        await this.logNicknameChange(oldMember, newMember);
        await this.logTimeoutChange(oldMember, newMember);
        await this.logRoleChanges(oldMember, newMember);
    }

    public static async logVerified(
        guild: Guild,
        member: GuildMember,
        method: "self" | "force",
        moderator?: User,
    ): Promise<void> {
        const embed = LogsEmbedBuilder.base(
            "✅ Użytkownik zweryfikowany",
            LOG_COLORS.success,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatMember(member),
                inline: true,
            },
            {
                name: "Sposób",
                value:
                    method === "self"
                        ? "Samodzielnie (kod weryfikacyjny)"
                        : "Ręcznie przez administrację",
                inline: true,
            },
            ...(method === "force" && moderator
                ? [
                    {
                        name: "Zweryfikował",
                        value: LogsEmbedBuilder.formatUser(moderator),
                        inline: true,
                    },
                ]
                : []),
        ]);

        LogsEmbedBuilder.withUserFooter(embed, member.user);

        await LogsService.send(
            guild,
            logsConfig.members.verified,
            embed,
            "weryfikacja użytkownika",
        );
    }

    private static async logKick(
        member: GuildMember | PartialGuildMember,
        executor: User | PartialUser | null,
        reason: string | null,
    ): Promise<void> {
        const embed = LogsEmbedBuilder.base(
            "👢 Wyrzucono użytkownika",
            LOG_COLORS.danger,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatUser(member.user),
                inline: true,
            },
            {
                name: "Moderator",
                value: LogsEmbedBuilder.formatModerator(executor),
                inline: true,
            },
            {
                name: "Powód",
                value: reason ?? "Nie podano powodu",
            },
        ]);

        LogsEmbedBuilder.withUserFooter(embed, member.user);

        await LogsService.send(
            member.guild,
            logsConfig.members.kick,
            embed,
            "wyrzucenie użytkownika",
        );
    }

    private static async logNicknameChange(
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember,
    ): Promise<void> {
        if (oldMember.nickname === newMember.nickname) {
            return;
        }

        const embed = LogsEmbedBuilder.base(
            "📝 Zmieniono pseudonim",
            LOG_COLORS.info,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatMember(newMember),
                inline: true,
            },
            {
                name: "Przed",
                value: oldMember.nickname ?? "*Brak*",
                inline: true,
            },
            {
                name: "Po",
                value: newMember.nickname ?? "*Brak*",
                inline: true,
            },
        ]);

        LogsEmbedBuilder.withUserFooter(embed, newMember.user);

        await LogsService.send(
            newMember.guild,
            logsConfig.members.nicknameUpdate,
            embed,
            "zmiana pseudonimu",
        );
    }

    private static async logTimeoutChange(
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember,
    ): Promise<void> {
        const oldTimeout =
            oldMember.communicationDisabledUntilTimestamp ?? null;

        const newTimeout =
            newMember.communicationDisabledUntilTimestamp ?? null;

        const isCurrentlyTimedOut =
            newTimeout !== null && newTimeout > Date.now();

        const wasCurrentlyTimedOut =
            oldTimeout !== null && oldTimeout > Date.now();

        if (isCurrentlyTimedOut === wasCurrentlyTimedOut) {
            return;
        }

        const entry = await LogsService.findAuditEntry(
            newMember.guild,
            AuditLogEvent.MemberUpdate,
            newMember.id,
        );

        const embed = LogsEmbedBuilder.base(
            isCurrentlyTimedOut
                ? "🔇 Wyciszono użytkownika (timeout)"
                : "🔊 Zdjęto wyciszenie (timeout)",
            isCurrentlyTimedOut ? LOG_COLORS.warning : LOG_COLORS.info,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatMember(newMember),
                inline: true,
            },
            {
                name: "Moderator",
                value: LogsEmbedBuilder.formatModerator(entry?.executor),
                inline: true,
            },
            ...(isCurrentlyTimedOut && newTimeout
                ? [
                    {
                        name: "Do kiedy",
                        value: `<t:${Math.floor(newTimeout / 1000)}:R>`,
                        inline: true,
                    },
                ]
                : []),
            ...(entry?.reason
                ? [
                    {
                        name: "Powód",
                        value: entry.reason,
                    },
                ]
                : []),
        ]);

        LogsEmbedBuilder.withUserFooter(embed, newMember.user);

        await LogsService.send(
            newMember.guild,
            logsConfig.members.timeout,
            embed,
            "zmiana wyciszenia (timeout)",
        );
    }

    private static async logRoleChanges(
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember,
    ): Promise<void> {
        const addedRoles = newMember.roles.cache.filter(
            (role) => !oldMember.roles.cache.has(role.id),
        );

        const removedRoles = oldMember.roles.cache.filter(
            (role) => !newMember.roles.cache.has(role.id),
        );

        if (addedRoles.size === 0 && removedRoles.size === 0) {
            return;
        }

        const entry = await LogsService.findAuditEntry(
            newMember.guild,
            AuditLogEvent.MemberRoleUpdate,
            newMember.id,
        );

        for (const role of addedRoles.values()) {
            if (role.id === verificationConfig.verifiedRoleId) {
                continue;
            }

            await this.sendRoleChangeLog(
                newMember,
                role.id,
                role.name,
                entry?.executor,
                "add",
            );
        }

        for (const role of removedRoles.values()) {
            await this.sendRoleChangeLog(
                newMember,
                role.id,
                role.name,
                entry?.executor,
                "remove",
            );
        }
    }

    private static async sendRoleChangeLog(
        member: GuildMember,
        roleId: string,
        roleName: string,
        executor: User | PartialUser | null | undefined,
        type: "add" | "remove",
    ): Promise<void> {
        const embed = LogsEmbedBuilder.base(
            type === "add" ? "➕ Nadano rolę" : "➖ Odebrano rolę",
            type === "add" ? LOG_COLORS.success : LOG_COLORS.warning,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatMember(member),
                inline: true,
            },
            {
                name: "Rola",
                value: `<@&${roleId}> (\`${roleName}\`)`,
                inline: true,
            },
            {
                name: "Wykonane przez",
                value: LogsEmbedBuilder.formatModerator(executor),
                inline: true,
            },
        ]);

        LogsEmbedBuilder.withUserFooter(embed, member.user);

        await LogsService.send(
            member.guild,
            type === "add"
                ? logsConfig.members.roleAdd
                : logsConfig.members.roleRemove,
            embed,
            type === "add" ? "nadanie roli" : "odebranie roli",
        );
    }
}