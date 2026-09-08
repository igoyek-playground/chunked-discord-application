import { EmbedBuilder, type GuildMember, type HexColorString, type PartialUser, type User } from "discord.js";

export const LOG_COLORS = {
    danger: "#ED4245",
    warning: "#FEE75C",
    success: "#57F287",
    info: "#5865F2",
    voice: "#EB459E",
    neutral: "#99AAB5",
} as const satisfies Record<string, HexColorString>;

export class LogsEmbedBuilder {
    public static base(
        title: string,
        color: HexColorString,
    ): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setTimestamp();
    }

    public static withUserFooter(
        embed: EmbedBuilder,
        user: User,
    ): EmbedBuilder {
        return embed
            .setThumbnail(user.displayAvatarURL())
            .setFooter({
                text: `ID: ${user.id}`,
                iconURL: user.displayAvatarURL(),
            });
    }

    public static formatUser(user: User | PartialUser): string {
        const label = user.tag ?? user.username ?? user.id;

        return `${user} (\`${label}\`)`;
    }

    public static formatMember(member: GuildMember): string {
        return this.formatUser(member.user);
    }

    public static formatModerator(
        executor: User | PartialUser | null | undefined,
    ): string {
        return executor
            ? this.formatUser(executor)
            : "Nieznany";
    }

    public static truncate(
        content: string,
        maxLength = 1024,
    ): string {
        if (content.length <= maxLength) {
            return content;
        }

        return `${content.slice(0, maxLength - 1)}…`;
    }
}