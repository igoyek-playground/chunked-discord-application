import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { RoleLogsService } from "../role-logs.service.js";

export default defineEvent({
    name: Events.GuildRoleUpdate,

    async execute(_bot, oldRole, newRole) {
        await RoleLogsService.logUpdate(oldRole, newRole);
    },
});
