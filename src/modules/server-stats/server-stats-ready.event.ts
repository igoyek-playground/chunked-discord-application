import { Events } from "discord.js";

import { defineEvent } from "../../core/structures/event.structure.js";
import { ServerStatsController } from "./server-stats.controller.js";

export default defineEvent({
    name: Events.ClientReady,
    once: true,

    async execute(bot) {
        await ServerStatsController.initialize(bot);
    },
});