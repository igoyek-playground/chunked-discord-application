import type { GuildMember, VoiceState } from "discord.js";

import { logsConfig } from "../../../config/modules/logs.config.js";
import { LOG_COLORS, LogsEmbedBuilder } from "./logs-embed.builder.js";
import { LogsService } from "./logs.service.js";

export class VoiceLogsService {
    public static async logVoiceStateUpdate(
        oldState: VoiceState,
        newState: VoiceState,
    ): Promise<void> {
        const member = newState.member ?? oldState.member;

        if (!member) {
            return;
        }

        if (oldState.channelId !== newState.channelId) {
            await this.logChannelChange(oldState, newState, member);
        }

        if (oldState.serverMute !== newState.serverMute) {
            await this.logMuteChange(newState, member);
        }

        if (oldState.serverDeaf !== newState.serverDeaf) {
            await this.logDeafenChange(newState, member);
        }
    }

    private static async logChannelChange(
        oldState: VoiceState,
        newState: VoiceState,
        member: GuildMember,
    ): Promise<void> {
        if (!oldState.channelId && newState.channelId) {
            const embed = LogsEmbedBuilder.base(
                "🎙️ Dołączono do kanału głosowego",
                LOG_COLORS.voice,
            ).addFields([
                {
                    name: "Użytkownik",
                    value: LogsEmbedBuilder.formatMember(member),
                    inline: true,
                },
                {
                    name: "Kanał",
                    value: `${newState.channel}`,
                    inline: true,
                },
            ]);

            LogsEmbedBuilder.withUserFooter(embed, member.user);

            await LogsService.send(
                member.guild,
                logsConfig.voice.join,
                embed,
                "dołączenie do kanału głosowego",
            );

            return;
        }

        if (oldState.channelId && !newState.channelId) {
            const embed = LogsEmbedBuilder.base(
                "🚪 Opuszczono kanał głosowy",
                LOG_COLORS.voice,
            ).addFields([
                {
                    name: "Użytkownik",
                    value: LogsEmbedBuilder.formatMember(member),
                    inline: true,
                },
                {
                    name: "Kanał",
                    value: `${oldState.channel}`,
                    inline: true,
                },
            ]);

            LogsEmbedBuilder.withUserFooter(embed, member.user);

            await LogsService.send(
                member.guild,
                logsConfig.voice.leave,
                embed,
                "opuszczenie kanału głosowego",
            );

            return;
        }

        if (oldState.channelId && newState.channelId) {
            const embed = LogsEmbedBuilder.base(
                "🔀 Zmieniono kanał głosowy",
                LOG_COLORS.voice,
            ).addFields([
                {
                    name: "Użytkownik",
                    value: LogsEmbedBuilder.formatMember(member),
                    inline: true,
                },
                {
                    name: "Z",
                    value: `${oldState.channel}`,
                    inline: true,
                },
                {
                    name: "Na",
                    value: `${newState.channel}`,
                    inline: true,
                },
            ]);

            LogsEmbedBuilder.withUserFooter(embed, member.user);

            await LogsService.send(
                member.guild,
                logsConfig.voice.move,
                embed,
                "zmiana kanału głosowego",
            );
        }
    }

    private static async logMuteChange(
        newState: VoiceState,
        member: GuildMember,
    ): Promise<void> {
        const embed = LogsEmbedBuilder.base(
            newState.serverMute
                ? "🔇 Wyciszono na kanale głosowym"
                : "🔊 Zdjęto wyciszenie na kanale głosowym",
            newState.serverMute ? LOG_COLORS.warning : LOG_COLORS.info,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatMember(member),
                inline: true,
            },
            {
                name: "Kanał",
                value: newState.channel ? `${newState.channel}` : "Nieznany",
                inline: true,
            },
        ]);

        LogsEmbedBuilder.withUserFooter(embed, member.user);

        await LogsService.send(
            member.guild,
            logsConfig.voice.muteUpdate,
            embed,
            "zmiana wyciszenia głosowego",
        );
    }

    private static async logDeafenChange(
        newState: VoiceState,
        member: GuildMember,
    ): Promise<void> {
        const embed = LogsEmbedBuilder.base(
            newState.serverDeaf
                ? "🔕 Ogłuszono na kanale głosowym"
                : "🔔 Zdjęto ogłuszenie na kanale głosowym",
            newState.serverDeaf ? LOG_COLORS.warning : LOG_COLORS.info,
        ).addFields([
            {
                name: "Użytkownik",
                value: LogsEmbedBuilder.formatMember(member),
                inline: true,
            },
            {
                name: "Kanał",
                value: newState.channel ? `${newState.channel}` : "Nieznany",
                inline: true,
            },
        ]);

        LogsEmbedBuilder.withUserFooter(embed, member.user);

        await LogsService.send(
            member.guild,
            logsConfig.voice.deafenUpdate,
            embed,
            "zmiana ogłuszenia głosowego",
        );
    }
}
