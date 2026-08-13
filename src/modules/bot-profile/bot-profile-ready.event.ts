import { Events } from "discord.js";

import { defineEvent } from "../../core/structures/event.structure.js";
import { BotProfileController } from "./bot-profile.controller.js";

export default defineEvent({
    name: Events.ClientReady,
    once: true,

    async execute(bot) {
        await BotProfileController.initialize(bot);
    },
});