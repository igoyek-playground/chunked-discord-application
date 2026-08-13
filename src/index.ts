import "dotenv/config";
import { Bot } from "./core/bot.js";
import { disconnectDatabase } from "./core/database/prisma.js";
import { logger } from "./core/utils/logger.js";

const token = process.env.APPLICATION_TOKEN;
if (!token) {
    logger.error("Brak APPLICATION_TOKEN w zmiennych środowiskowych (.env)");
    process.exit(1);
}

const bot = new Bot();

bot.once("clientReady", (readyClient) => {
    logger.welcomer();
    console.log(`🤖 Zalogowano jako ${readyClient.user.tag}`);
});

let isShuttingDown = false;
async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) return;

    isShuttingDown = true;

    logger.info(`Otrzymano ${signal}, zamykanie bota...`);

    await disconnectDatabase();
    bot.destroy();

    process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

bot.start(token).catch((error) => {
    console.error("❌ Krytyczny błąd podczas startu bota:", error);
    process.exit(1);
});
