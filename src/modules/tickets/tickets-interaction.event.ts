import { Events } from "discord.js";

import { defineEvent } from "../../core/structures/event.structure.js";
import { TicketsController } from "./tickets.controller.js";
import { TICKET_CUSTOM_IDS } from "./tickets.constants.js";

export default defineEvent({
    name: Events.InteractionCreate,

    async execute(_bot, interaction) {
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === TICKET_CUSTOM_IDS.categorySelect) {
                await TicketsController.handleCategorySelect(interaction);
            }

            return;
        }

        if (interaction.isUserSelectMenu()) {
            if (interaction.customId === TICKET_CUSTOM_IDS.settingsAddUserSelect) {
                await TicketsController.handleSettingsAddUserSelect(interaction);
            }

            return;
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith(TICKET_CUSTOM_IDS.modalPrefix)) {
                await TicketsController.handleModalSubmit(interaction);

                return;
            }

            if (interaction.customId === TICKET_CUSTOM_IDS.settingsSendDmModal) {
                await TicketsController.handleSettingsSendDmModalSubmit(
                    interaction,
                );
            }

            return;
        }

        if (!interaction.isButton()) {
            return;
        }

        switch (interaction.customId) {
            case TICKET_CUSTOM_IDS.close:
                await TicketsController.handleCloseButtonClick(interaction);
                break;

            case TICKET_CUSTOM_IDS.closeConfirm:
                await TicketsController.handleCloseConfirm(interaction);
                break;

            case TICKET_CUSTOM_IDS.closeCancel:
                await TicketsController.handleCloseCancel(interaction);
                break;

            case TICKET_CUSTOM_IDS.claim:
                await TicketsController.handleClaimButtonClick(interaction);
                break;

            case TICKET_CUSTOM_IDS.settings:
                await TicketsController.handleSettingsButtonClick(interaction);
                break;

            case TICKET_CUSTOM_IDS.settingsAddUser:
                await TicketsController.handleSettingsAddUserButtonClick(
                    interaction,
                );
                break;

            case TICKET_CUSTOM_IDS.settingsNotifyOwner:
                await TicketsController.handleSettingsNotifyOwner(interaction);
                break;

            case TICKET_CUSTOM_IDS.settingsSendDm:
                await TicketsController.handleSettingsSendDmButtonClick(
                    interaction,
                );
                break;
        }
    },
});
