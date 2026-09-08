import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { MessageLogsService } from "../message-logs.service.js";

export default defineEvent({
    name: Events.MessageBulkDelete,

    async execute(_bot, messages, channel) {
        await MessageLogsService.logBulkDelete(messages, channel);
    },
});
