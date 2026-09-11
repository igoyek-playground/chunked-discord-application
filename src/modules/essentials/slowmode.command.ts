import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";

import { defineCommand } from "../../core/structures/command.structure.js";
import { logger } from "../../core/utils/logger.js";

const CHANNEL_TYPES = [
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildVoice,
    ChannelType.GuildStageVoice,
] as const;

const MAX_SLOWMODE_SECONDS = 21_600;

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription(
            "Ustawia spowolnienie (slowmode) na kanale.",
        )
        .addIntegerOption((option) =>
            option
                .setName("sekundy")
                .setDescription(
                    "Odstęp między wiadomościami w sekundach (0 = wyłącz).",
                )
                .setMinValue(0)
                .setMaxValue(MAX_SLOWMODE_SECONDS)
                .setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName("kanal")
                .setDescription(
                    "Kanał docelowy (domyślnie bieżący).",
                )
                .addChannelTypes(...CHANNEL_TYPES)
                .setRequired(false),
        ),

    userPermissions: [PermissionFlagsBits.ManageChannels],
    botPermissions: [PermissionFlagsBits.ManageChannels],

    async execute(interaction) {
        if (!interaction.inGuild()) {
            return;
        }

        const seconds = interaction.options.getInteger(
            "sekundy",
            true,
        );

        const selectedChannel = interaction.options.getChannel(
            "kanal",
            false,
            CHANNEL_TYPES,
        );

        const channel = selectedChannel ?? interaction.channel;

        if (!channel || !("setRateLimitPerUser" in channel)) {
            await interaction.reply({
                content:
                    `\`[ ✘ \`] Ten kanał nie obsługuje spowolnienia.`,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        try {
            await channel.setRateLimitPerUser(
                seconds,
                `Ustawione przez ${interaction.user.tag}`,
            );

            await interaction.reply({
                content:
                    seconds === 0
                        ? `\`[ ✔ \`] Wyłączono spowolnienie na <#${channel.id}>.`
                        : `\`[ ✔ \`] Ustawiono spowolnienie ${seconds}s na <#${channel.id}>.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            logger.error(
                "Błąd podczas ustawiania spowolnienia (/slowmode):",
                error,
            );

            await interaction.reply({
                content:
                    `\`[ ✘ \`] Nie udało się ustawić spowolnienia — sprawdź uprawnienia bota (Zarządzaj kanałami) na tym kanale.`,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
});