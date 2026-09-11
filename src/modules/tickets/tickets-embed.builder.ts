import {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    type GuildMember,
    type MessageCreateOptions,
} from "discord.js";

import { ticketsConfig } from "../../../config/modules/tickets.config.js";
import type {
    TicketAnswer,
    TicketButtonConfig,
    TicketCategoryConfig,
} from "./tickets.types.js";
import { TICKET_CUSTOM_IDS } from "./tickets.constants.js";

function buildButton(
    customId: string,
    config: TicketButtonConfig,
): ButtonBuilder {
    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(config.label)
        .setStyle(config.style);

    if (config.emoji) {
        button.setEmoji(config.emoji);
    }

    return button;
}

export class TicketsEmbedBuilder {
    public static buildPingContent(
        category: TicketCategoryConfig,
        owner: GuildMember,
    ): string | null {
        const roleMentions = category.pingRoleIds
            .map((roleId) => `<@&${roleId}>`)
            .join(" ");

        const content = `${roleMentions} ${owner}`.trim();

        return content.length > 0 ? content : null;
    }

    public static buildTicketMessage(
        category: TicketCategoryConfig,
        owner: GuildMember,
        answers: TicketAnswer[],
    ): MessageCreateOptions {
        const embed = new EmbedBuilder()
            .setColor(ticketsConfig.ticketMessage.embedColor)
            .setTitle(category.select.label)
            .setThumbnail(owner.displayAvatarURL())
            .addFields(
                {
                    name: "Zainteresowany",
                    value: `${owner} (\`${owner.user.tag}\`)`,
                    inline: false,
                },
                ...answers.map((answer) => ({
                    name: answer.label,
                    value: answer.value.slice(0, 1024) || "*brak odpowiedzi*",
                    inline: false,
                })),
            )
            .setFooter({ text: `ID: ${owner.id}` })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            buildButton(TICKET_CUSTOM_IDS.close, ticketsConfig.buttons.close),
            buildButton(TICKET_CUSTOM_IDS.claim, ticketsConfig.buttons.claim),
            buildButton(
                TICKET_CUSTOM_IDS.settings,
                ticketsConfig.buttons.settings,
            ),
        );

        return {
            embeds: [embed],
            components: [row],
        };
    }

    public static buildCloseConfirmRow(): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            buildButton(
                TICKET_CUSTOM_IDS.closeConfirm,
                ticketsConfig.buttons.closeConfirm,
            ),
            buildButton(
                TICKET_CUSTOM_IDS.closeCancel,
                ticketsConfig.buttons.closeCancel,
            ),
        );
    }

    public static buildSettingsRow(): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            buildButton(
                TICKET_CUSTOM_IDS.settingsAddUser,
                ticketsConfig.buttons.settingsAddUser,
            ),
            buildButton(
                TICKET_CUSTOM_IDS.settingsNotifyOwner,
                ticketsConfig.buttons.settingsNotifyOwner,
            ),
            buildButton(
                TICKET_CUSTOM_IDS.settingsSendDm,
                ticketsConfig.buttons.settingsSendDm,
            ),
        );
    }
}
