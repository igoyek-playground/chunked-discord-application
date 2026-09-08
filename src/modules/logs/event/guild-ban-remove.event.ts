import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { MemberLogsService } from "../member-logs.service.js";

export default defineEvent({
    name: Events.GuildBanRemove,

    async execute(_bot, ban) {
        await MemberLogsService.logUnban(ban);
    },
});
