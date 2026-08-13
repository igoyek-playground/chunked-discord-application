import type { Bot } from "../../core/bot.js";

import { botProfileConfig } from "../../../config/bot-profile.config.js";
import { logger } from "../../core/utils/logger.js";
import { BotProfileService } from "./bot-profile.service.js";

export class BotProfileController {
    private static refreshInterval:
        NodeJS.Timeout | null = null;

    public static async initialize(
        bot: Bot,
    ): Promise<void> {
        try {
            await BotProfileService.apply(bot);

            this.startPresenceRefresh(bot);

            logger.success(
                "Załadowano konfigurację profilu bota",
            );
        } catch (error) {
            logger.error(
                "Nie udało się zastosować konfiguracji profilu bota:",
                error,
            );
        }
    }

    private static startPresenceRefresh(
        bot: Bot,
    ): void {
        const refreshInterval = botProfileConfig.presence.refreshIntervalSeconds * 1000;

        if (refreshInterval <= 0) {
            return;
        }

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(
            () => {
                try {
                    BotProfileService.updatePresence(bot);
                } catch (error) {
                    logger.error(
                        "Nie udało się odświeżyć presence bota:",
                        error,
                    );
                }
            },
            refreshInterval,
        );
    }
}