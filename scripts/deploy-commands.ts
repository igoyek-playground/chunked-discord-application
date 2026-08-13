import "dotenv/config";

import { Bot } from "../src/core/bot.js";
import {
    loadCommands,
    deployCommands,
} from "../src/core/handlers/command-handler.js";

const applicationId = process.env.APPLICATION_ID;
const guildId = process.env.GUILD_ID;

if (!applicationId) {
    throw new Error("Brak APPLICATION_ID w .env");
}

const bot = new Bot();

await loadCommands(bot);

await deployCommands(
    bot,
    applicationId,
    guildId,
);

process.exit(0);