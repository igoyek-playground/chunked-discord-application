import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { MessageLogsService } from "../message-logs.service.js";

export default defineEvent({
    name: Events.MessageUpdate,

    async execute(_bot, oldMessage, newMessage) {
        await MessageLogsService.logEdit(oldMessage, newMessage);
    },
});
