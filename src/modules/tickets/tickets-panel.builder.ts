import {
    ActionRowBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    type MessageCreateOptions,
} from "discord.js";

import { ticketsConfig } from "../../../config/modules/tickets.config.js";
import { TICKET_CUSTOM_IDS } from "./tickets.constants.js";

export class TicketsPanelBuilder {
    public static build(): MessageCreateOptions {
        const embed = new EmbedBuilder()
            .setColor(ticketsConfig.panel.accentColor)
            .setTitle(ticketsConfig.panel.title)
            .setDescription(ticketsConfig.panel.description);

        if (ticketsConfig.panel.footer) {
            embed.setFooter({ text: ticketsConfig.panel.footer });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(TICKET_CUSTOM_IDS.categorySelect)
            .setPlaceholder(ticketsConfig.panel.placeholder)
            .addOptions(
                ticketsConfig.categories.map((category) => ({
                    label: category.select.label,
                    description: category.select.description,
                    emoji: category.select.emoji,
                    value: category.key,
                })),
            );

        const row =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                select,
            );

        return {
            embeds: [embed],
            components: [row],
        };
    }
}
