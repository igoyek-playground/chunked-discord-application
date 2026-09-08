import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { ChannelLogsService } from "../channel-logs.service.js";

export default defineEvent({
    name: Events.ChannelUpdate,

    async execute(_bot, oldChannel, newChannel) {
        await ChannelLogsService.logUpdate(oldChannel, newChannel);
    },
});
