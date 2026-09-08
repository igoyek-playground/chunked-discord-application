import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { RoleLogsService } from "../role-logs.service.js";

export default defineEvent({
    name: Events.GuildRoleCreate,

    async execute(_bot, role) {
        await RoleLogsService.logCreate(role);
    },
});
