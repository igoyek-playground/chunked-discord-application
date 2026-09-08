import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { MessageLogsService } from "../message-logs.service.js";

export default defineEvent({
    name: Events.MessageDelete,

    async execute(_bot, message) {
        await MessageLogsService.logDelete(message);
    },
});
