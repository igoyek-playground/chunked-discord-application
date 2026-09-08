import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { ChannelLogsService } from "../channel-logs.service.js";

export default defineEvent({
    name: Events.ChannelCreate,

    async execute(_bot, channel) {
        await ChannelLogsService.logCreate(channel);
    },
});
