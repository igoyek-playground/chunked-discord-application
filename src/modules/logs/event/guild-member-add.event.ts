import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { MemberLogsService } from "../member-logs.service.js";

export default defineEvent({
    name: Events.GuildMemberAdd,

    async execute(_bot, member) {
        await MemberLogsService.logJoin(member);
    },
});
