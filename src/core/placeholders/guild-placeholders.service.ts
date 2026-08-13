import type { Guild, GuildMember } from "discord.js";

export class GuildPlaceholderService {
    public static resolve(
        template: string,
        guild: Guild,
    ): string {
        let result = template;

        result = result.replaceAll(
            "{MEMBER_COUNT}",
            this.getMemberCount(guild).toString(),
        );

        result = result.replaceAll(
            "{MEMBER_ONLINE}",
            this.getOnlineMemberCount(guild).toString(),
        );

        result = result.replace(
            /\{MEMBERS_ROLE_(\d+)\}/g,
            (_, roleId: string) =>
                this.getMembersWithRole(guild, roleId).toString(),
        );

        result = result.replace(
            /\{MEMBERS_ONLINE_ROLE_(\d+)\}/g,
            (_, roleId: string) =>
                this.getOnlineMembersWithRole(guild, roleId).toString(),
        );

        return result;
    }

    private static getMemberCount(guild: Guild): number {
        return guild.members.cache.filter(
            (member) => this.isHuman(member),
        ).size;
    }

    private static getOnlineMemberCount(guild: Guild): number {
        return guild.members.cache.filter(
            (member) =>
                this.isHuman(member) &&
                this.isOnline(member),
        ).size;
    }

    private static getMembersWithRole(
        guild: Guild,
        roleId: string,
    ): number {
        return guild.members.cache.filter(
            (member) =>
                this.isHuman(member) &&
                member.roles.cache.has(roleId),
        ).size;
    }

    private static getOnlineMembersWithRole(
        guild: Guild,
        roleId: string,
    ): number {
        return guild.members.cache.filter(
            (member) =>
                this.isHuman(member) &&
                this.isOnline(member) &&
                member.roles.cache.has(roleId),
        ).size;
    }

    private static isHuman(member: GuildMember): boolean {
        return !member.user.bot;
    }

    private static isOnline(member: GuildMember): boolean {
        const status = member.presence?.status;

        return (
            status === "online" ||
            status === "idle" ||
            status === "dnd"
        );
    }
}