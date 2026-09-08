import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { ServerLogsService } from "../server-logs.service.js";

export default defineEvent({
    name: Events.InviteCreate,

    async execute(_bot, invite) {
        await ServerLogsService.logInviteCreate(invite);
    },
});
