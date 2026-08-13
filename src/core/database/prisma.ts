import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../../generated/prisma/client.js";

import { logger } from "../utils/logger.js";

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

export const prisma = new PrismaClient({
    adapter,
    log:
        process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
});

export async function connectDatabase(): Promise<void> {
    try {
        await prisma.$connect();
        logger.success("Połączono z bazą danych");
    } catch (error) {
        logger.error("Nie udało się połączyć z bazą danych:", error);
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
}