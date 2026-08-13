import type { Guild } from "discord.js";

import type { Bot } from "../../core/bot.js";

import { botProfileConfig } from "../../../config/bot-profile.config.js";
import { logger } from "../../core/utils/logger.js";
import { GuildPlaceholderService } from "../../core/placeholders/guild-placeholders.service.js";

export class BotProfileService {
    public static async apply(bot: Bot): Promise<void> {
        if (!bot.user) {
            throw new Error(
                "Nie można skonfigurować profilu przed zalogowaniem bota.",
            );
        }

        await this.applyUsername(bot);
        await this.applyAvatar(bot);
        await this.applyBanner(bot);

        this.updatePresence(bot);

        await this.applyApplicationDescription(bot);
    }

    public static updatePresence(bot: Bot): void {
        if (!bot.user) {
            return;
        }

        const guild = this.getGuild(bot);

        if (!guild) {
            return;
        }

        const { presence } = botProfileConfig;

        const activity = presence.activity
            ? {
                type: presence.activity.type,
                name: GuildPlaceholderService.resolve(
                    presence.activity.name,
                    guild,
                ),
            }
            : null;

        bot.user.setPresence({
            status: presence.status,
            afk: presence.afk,
            activities: activity ? [activity] : [],
        });
    }

    private static getGuild(bot: Bot): Guild | undefined {
        const guildId = process.env.GUILD_ID;

        if (!guildId) {
            throw new Error("Brak GUILD_ID w .env");
        }

        return bot.guilds.cache.get(guildId);
    }

    private static async applyUsername(bot: Bot): Promise<void> {
        const username = botProfileConfig.username;

        if (!username || bot.user!.username === username) {
            return;
        }

        await bot.user!.setUsername(username);

        logger.info(
            `Zaktualizowano nazwę bota na "${username}"`,
        );
    }

    private static async applyAvatar(bot: Bot): Promise<void> {
        const avatarPath = botProfileConfig.avatarPath;

        if (!avatarPath) {
            return;
        }

        await bot.user!.setAvatar(avatarPath);
    }

    private static async applyBanner(bot: Bot): Promise<void> {
        const bannerPath = botProfileConfig.bannerPath;

        if (!bannerPath) {
            return;
        }

        await bot.user!.setBanner(bannerPath);
    }

    private static async applyApplicationDescription(
        bot: Bot,
    ): Promise<void> {
        const description =
            botProfileConfig.applicationDescription;

        if (!description) {
            return;
        }

        await bot.rest.patch(
            "/applications/@me",
            {
                body: {
                    description,
                },
            },
        );
    }
}