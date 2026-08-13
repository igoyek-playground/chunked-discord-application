import {
    ChannelType,
    type Guild,
} from "discord.js";

import { serverStatsConfig } from "../../../config/modules/server-stats.config.js";
import { logger } from "../../core/utils/logger.js";
import { GuildPlaceholderService } from "../../core/placeholders/guild-placeholders.service.js";

export class ServerStatsService {
    public static async updateAll(guild: Guild): Promise<void> {
        for (const stat of serverStatsConfig.channels) {
            try {
                if (stat.channelId === "0") {
                    continue;
                }

                const channel = guild.channels.cache.get(
                    stat.channelId,
                );

                if (!channel) {
                    logger.warn(
                        `Nie znaleziono kanału statystyk: ${stat.channelId}`,
                    );

                    continue;
                }

                if (channel.type !== ChannelType.GuildVoice) {
                    logger.warn(
                        `Kanał ${stat.channelId} nie jest kanałem głosowym`,
                    );

                    continue;
                }

                const newName = GuildPlaceholderService.resolve(
                    stat.name,
                    guild,
                );

                if (channel.name === newName) {
                    continue;
                }

                await channel.setName(
                    newName,
                    "Aktualizacja statystyk serwera",
                );
            } catch (error) {
                logger.error(
                    `Nie udało się zaktualizować kanału statystyk ${stat.channelId}:`,
                    error,
                );
            }
        }
    }
}