import { Events } from "discord.js";

import { defineEvent } from "../../core/structures/event.structure.js";
import { VERIFICATION_CUSTOM_IDS } from "./verification.constants.js";
import { VerificationController } from "./verification.controller.js";

export default defineEvent({
    name: Events.InteractionCreate,

    async execute(_bot, interaction) {
        if (
            interaction.isButton() &&
            interaction.customId ===
                VERIFICATION_CUSTOM_IDS.verifyButton
        ) {
            await VerificationController.handleVerifyButton(
                interaction,
            );

            return;
        }

        if (
            interaction.isModalSubmit() &&
            interaction.customId ===
                VERIFICATION_CUSTOM_IDS.verifyModal
        ) {
            await VerificationController.handleModalSubmit(
                interaction,
            );
        }
    },
});