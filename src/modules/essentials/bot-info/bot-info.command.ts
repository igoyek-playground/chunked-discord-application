import {
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js";

import { defineCommand } from "../../../core/structures/command.structure.js";
import { BotInfoEmbedBuilder } from "./bot-info-embed.builder.js";
import { BotInfoService } from "./bot-info.service.js";

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("bot-info")
        .setDescription(
            "Wyświetla informacje o bocie i maszynie, na której działa.",
        ),

    async execute(interaction, bot) {
        const sent = await interaction.reply({
            content: "⏳ Zbieranie informacji...",
            flags: MessageFlags.Ephemeral,
            withResponse: true,
        });

        const restMs = sent.resource?.message
            ? sent.resource.message.createdTimestamp -
              interaction.createdTimestamp
            : 0;

        const gatewayMs = Math.max(bot.ws.ping, 0);

        const stats = BotInfoService.collect(bot);

        const embed = BotInfoEmbedBuilder.build(
            bot,
            stats,
            { gatewayMs, restMs },
            interaction.user.tag,
        );

        await interaction.editReply({
            content: null,
            embeds: [embed],
        });
    },
});