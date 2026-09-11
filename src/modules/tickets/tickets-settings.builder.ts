import {
    ActionRowBuilder,
    LabelBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    UserSelectMenuBuilder,
} from "discord.js";

import { ticketsConfig } from "../../../config/modules/tickets.config.js";
import { TICKET_CUSTOM_IDS } from "./tickets.constants.js";

export class TicketsSettingsBuilder {
    public static buildAddUserSelectRow(): ActionRowBuilder<UserSelectMenuBuilder> {
        const select = new UserSelectMenuBuilder()
            .setCustomId(TICKET_CUSTOM_IDS.settingsAddUserSelect)
            .setPlaceholder("Wybierz użytkownika do dodania")
            .setMinValues(1)
            .setMaxValues(1);

        return new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
            select,
        );
    }

    public static buildSendDmModal(): ModalBuilder {
        const textInput = new TextInputBuilder()
            .setCustomId(TICKET_CUSTOM_IDS.settingsSendDmInput)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(2000)
            .setPlaceholder(ticketsConfig.messages.settingsDmInputPlaceholder);

        const label = new LabelBuilder()
            .setLabel(ticketsConfig.messages.settingsDmInputLabel)
            .setTextInputComponent(textInput);

        return new ModalBuilder()
            .setCustomId(TICKET_CUSTOM_IDS.settingsSendDmModal)
            .setTitle(ticketsConfig.messages.settingsDmModalTitle.slice(0, 45))
            .addLabelComponents(label);
    }
}
