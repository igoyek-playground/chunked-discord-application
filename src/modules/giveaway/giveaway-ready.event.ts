import { Events } from "discord.js";

import { defineEvent } from "../../core/structures/event.structure.js";
import { GiveawayController } from "./giveaway.controller.js";

export default defineEvent({
    name: Events.ClientReady,
    once: true,

    async execute(bot) {
        GiveawayController.initialize(bot);
    },
});
