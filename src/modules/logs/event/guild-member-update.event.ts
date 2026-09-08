import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { MemberLogsService } from "../member-logs.service.js";

export default defineEvent({
    name: Events.GuildMemberUpdate,

    async execute(_bot, oldMember, newMember) {
        await MemberLogsService.logMemberUpdate(oldMember, newMember);
    },
});
