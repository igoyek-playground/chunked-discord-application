import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { Bot } from "../bot.js";
import type { Command } from "../structures/command.structure.js";

import { REST, Routes } from "discord.js";

import { findFiles } from "../utils/file-discovery.js";
import { logger } from "../utils/logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODULES_DIR = join(
    __dirname,
    "..",
    "..",
    "modules",
);

const COMMAND_FILE_PATTERN = /\.command\.(ts|js)$/;

export async function loadCommands(
    bot: Bot,
): Promise<void> {
    const commandFiles = findFiles(
      MODULES_DIR,
      COMMAND_FILE_PATTERN,
    );

    let loadedCount = 0;

    for (const filePath of commandFiles) {
      try {
        const imported = await import(
          pathToFileURL(filePath).href
        );

        const command: unknown = imported.default;

        if (!isValidCommand(command)) {
          logger.warn(
            `Pominięto niepoprawną komendę: ${filePath}`,
          );

          continue;
        }

        if (bot.commands.has(command.data.name)) {
          logger.warn(
            `Duplikat komendy "${command.data.name}": ${filePath}`,
          );

          continue;
        }

        bot.commands.set(
          command.data.name,
          command,
        );

        loadedCount++;
      } catch (error) {
        logger.error(
          `Błąd ładowania komendy (${filePath}):`,
          error,
        );
      }
    }

    logger.info(
      `Załadowano ${loadedCount} komend`,
    );
}

function isValidCommand(
    command: unknown,
): command is Command {
    if (
        typeof command !== "object" ||
        command === null
    ) {
        return false;
    }

    const candidate = command as Partial<Command>;

    return (
        candidate.data !== undefined &&
        typeof candidate.data.name === "string" &&
        typeof candidate.execute === "function"
    );
}

export async function deployCommands(
    bot: Bot,
    applicationId: string,
    guildId?: string,
): Promise<void> {
    const token = process.env.APPLICATION_TOKEN;

    if (!token) {
      throw new Error(
        "Brak APPLICATION_TOKEN w zmiennych środowiskowych (.env)",
      );
    }

    const commands = [...bot.commands.values()].map(
        (command) => command.data.toJSON(),
    );

    const rest = new REST().setToken(token);

    const route = guildId
        ? Routes.applicationGuildCommands(applicationId, guildId)
        : Routes.applicationCommands(applicationId);

    await rest.put(route, {
        body: commands,
    });

    logger.success(
        `Zarejestrowano ${commands.length} komend ${
            guildId
                ? `na serwerze ${guildId}`
                : "globalnie"
        }`,
    );
}