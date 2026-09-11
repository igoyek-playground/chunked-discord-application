import {
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js";

import { defineCommand } from "../../../core/structures/command.structure.js";
import { ServerInfoEmbedBuilder } from "./server-info-embed.builder.js";
import { ServerInfoService } from "./server-info.service.js";

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("server-info")
        .setDescription(
            "Wyświetla informacje o tym serwerze.",
        ),

    async execute(interaction) {
        if (!interaction.inGuild() || !interaction.guild) {
            await interaction.reply({
                content:
                    `\`[ ✘ \`] Tej komendy można użyć tylko na serwerze.`,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        const stats = ServerInfoService.collect(
            interaction.guild,
        );

        const embed = ServerInfoEmbedBuilder.build(
            stats,
            interaction.user.tag,
        );

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    },
});