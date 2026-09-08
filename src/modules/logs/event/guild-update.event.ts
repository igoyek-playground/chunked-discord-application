import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { ServerLogsService } from "../server-logs.service.js";

export default defineEvent({
    name: Events.GuildUpdate,

    async execute(_bot, oldGuild, newGuild) {
        await ServerLogsService.logGuildUpdate(oldGuild, newGuild);
    },
});
