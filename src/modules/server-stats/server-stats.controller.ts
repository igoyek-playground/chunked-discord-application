import type { Bot } from "../../core/bot.js";

import { serverStatsConfig } from "../../../config/modules/server-stats.config.js";
import { logger } from "../../core/utils/logger.js";
import { ServerStatsService } from "./server-stats.service.js";

export class ServerStatsController {
    private static refreshInterval:
        NodeJS.Timeout | null = null;

    public static async initialize(
        bot: Bot,
    ): Promise<void> {
        if (!serverStatsConfig.enabled) {
            logger.info(
                "Moduł statystyk serwera jest wyłączony",
            );

            return;
        }

        try {
            const guildId = process.env.GUILD_ID;

            if (!guildId) {
                throw new Error(
                    "Brak GUILD_ID w zmiennych środowiskowych (.env)",
                );
            }

            const guild = bot.guilds.cache.get(guildId);

            if (!guild) {
                throw new Error(
                    `Nie znaleziono serwera ${guildId}`,
                );
            }

            await ServerStatsService.updateAll(guild);

            this.startRefreshInterval(bot);

            logger.success(
                "Uruchomiono moduł statystyk serwera",
            );
        } catch (error) {
            logger.error(
                "Nie udało się uruchomić modułu statystyk serwera:",
                error,
            );
        }
    }

    private static startRefreshInterval(
        bot: Bot,
    ): void {
        const intervalSeconds =
            serverStatsConfig.refreshIntervalSeconds;

        if (intervalSeconds <= 0) {
            return;
        }

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(
            async () => {
                try {
                    const guildId = process.env.GUILD_ID;

                    if (!guildId) {
                        return;
                    }

                    const guild =
                        bot.guilds.cache.get(guildId);

                    if (!guild) {
                        return;
                    }

                    await ServerStatsService.updateAll(
                        guild,
                    );
                } catch (error) {
                    logger.error(
                        "Nie udało się odświeżyć statystyk serwera:",
                        error,
                    );
                }
            },
            intervalSeconds * 1000,
        );
    }
}