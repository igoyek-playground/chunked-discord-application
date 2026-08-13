import type { Bot } from "../bot.js";
import type { Guild } from "discord.js";

import { logger } from "../utils/logger.js";

export class GuildCacheService {
    public static getGuild(bot: Bot): Guild {
        const guildId = process.env.GUILD_ID;

        if (!guildId) {
            throw new Error(
                "Brak GUILD_ID w zmiennych środowiskowych (.env)",
            );
        }

        const guild = bot.guilds.cache.get(guildId);

        if (!guild) {
            throw new Error(
                `Nie znaleziono serwera o ID ${guildId}`,
            );
        }

        return guild;
    }

    public static async initialize(bot: Bot): Promise<void> {
        const guild = this.getGuild(bot);

        await guild.members.fetch({
            withPresences: true,
        });

        logger.success(
            `Załadowano cache użytkowników serwera (${guild.members.cache.size})`,
        );
    }
}