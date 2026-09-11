import { Events } from "discord.js";

import { defineEvent } from "../../core/structures/event.structure.js";
import { GiveawayController } from "./giveaway.controller.js";

const GIVEAWAY_PREFIX = "giveaway";

export default defineEvent({
    name: Events.InteractionCreate,

    async execute(bot, interaction) {
        if (!interaction.isButton()) {
            return;
        }

        const [prefix, action, giveawayId] =
            interaction.customId.split(":");

        if (prefix !== GIVEAWAY_PREFIX || !giveawayId) {
            return;
        }

        if (action === "join") {
            await GiveawayController.handleJoinButtonClick(
                interaction,
                giveawayId,
                bot,
            );

            return;
        }

        if (action === "leave") {
            await GiveawayController.handleLeaveButtonClick(
                interaction,
                giveawayId,
                bot,
            );
        }
    },
});