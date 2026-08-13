import { Events } from "discord.js";

import { defineEvent } from "../structures/event.structure.js";
import { GuildCacheService } from "../guild/guild-cache.service.js";
import { logger } from "../utils/logger.js";

export default defineEvent({
    name: Events.ClientReady,
    once: true,

    async execute(bot) {
        try {
            await GuildCacheService.initialize(bot);
        } catch (error) {
            logger.error(
                "Nie udało się przygotować cache serwera:",
                error,
            );
        }
    },
});