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

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("lockdown")
        .setDescription(
            "Blokuje lub odblokowuje możliwość pisania dla @everyone na kanale (przełącznik).",
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
        if (!interaction.inGuild() || !interaction.guild) {
            return;
        }

        const selectedChannel = interaction.options.getChannel(
            "kanal",
            false,
            CHANNEL_TYPES,
        );

        const channel = selectedChannel ?? interaction.channel;

        if (!channel || !("permissionOverwrites" in channel)) {
            await interaction.reply({
                content:
                    `\`[ ✘ \`] Tego kanału nie można zablokować w ten sposób.`,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        const everyoneRole = interaction.guild.roles.everyone;

        const existingOverwrite =
            channel.permissionOverwrites.cache.get(
                everyoneRole.id,
            );

        const isCurrentlyLocked =
            existingOverwrite?.deny.has(
                PermissionFlagsBits.SendMessages,
            ) ?? false;

        try {
            await channel.permissionOverwrites.edit(
                everyoneRole,
                {
                    SendMessages: isCurrentlyLocked
                        ? null
                        : false,
                },
                {
                    reason: `${
                        isCurrentlyLocked
                            ? "Odblokowano"
                            : "Zablokowano"
                    } przez ${interaction.user.tag}`,
                },
            );

            await interaction.reply({
                content: isCurrentlyLocked
                    ? `\`[ ✔ \`] Odblokowano kanał <#${channel.id}> — @everyone może ponownie pisać.`
                    : `\`[ ✔ \`] Zablokowano kanał <#${channel.id}> — @everyone nie może teraz pisać.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            logger.error(
                "Błąd podczas zmiany blokady kanału (/lockdown):",
                error,
            );

            await interaction.reply({
                content:
                    `\`[ ✘ \`] Nie udało się zmienić blokady kanału — sprawdź uprawnienia bota (Zarządzaj kanałami) na tym kanale.`,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
});