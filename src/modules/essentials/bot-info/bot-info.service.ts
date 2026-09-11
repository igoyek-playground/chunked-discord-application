import os from "node:os";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { version as discordJsVersion } from "discord.js";

import type { Bot } from "../../../core/bot.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// src/modules/bot-info -> katalog główny projektu
const PACKAGE_JSON_PATH = join(
    __dirname,
    "..",
    "..",
    "..",
    "package.json",
);

export interface BotInfoStats {
    version: string;
    discordJsVersion: string;
    nodeVersion: string;

    uptimeMs: number;

    guildCount: number;
    userCount: number;
    channelCount: number;
    commandCount: number;

    processMemoryBytes: number;
    heapUsedBytes: number;
    heapTotalBytes: number;

    osType: string;
    osRelease: string;
    osArch: string;
    cpuModel: string;
    cpuCoreCount: number;
    systemMemoryUsedBytes: number;
    systemMemoryTotalBytes: number;
}

export class BotInfoService {
    public static collect(bot: Bot): BotInfoStats {
        const { version } = this.readPackageJson();
        const memoryUsage = process.memoryUsage();
        const cpus = os.cpus();

        return {
            version,
            discordJsVersion,
            nodeVersion: process.version,

            uptimeMs: bot.uptime ?? 0,

            guildCount: bot.guilds.cache.size,
            userCount: bot.guilds.cache.reduce(
                (sum, guild) => sum + guild.memberCount,
                0,
            ),
            channelCount: bot.channels.cache.size,
            commandCount: bot.commands.size,

            processMemoryBytes: memoryUsage.rss,
            heapUsedBytes: memoryUsage.heapUsed,
            heapTotalBytes: memoryUsage.heapTotal,

            osType: os.type(),
            osRelease: os.release(),
            osArch: os.arch(),
            cpuModel:
                cpus[0]?.model.replace(/\s+/g, " ").trim() ??
                "Nieznany",
            cpuCoreCount: cpus.length,
            systemMemoryUsedBytes:
                os.totalmem() - os.freemem(),
            systemMemoryTotalBytes: os.totalmem(),
        };
    }

    private static readPackageJson(): { version: string } {
        try {
            const raw = readFileSync(
                PACKAGE_JSON_PATH,
                "utf-8",
            );

            const parsed = JSON.parse(raw) as {
                version?: string;
            };

            return {
                version: parsed.version ?? "nieznana",
            };
        } catch {
            return { version: "nieznana" };
        }
    }
}