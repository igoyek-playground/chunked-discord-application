import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { Bot } from "../bot.js";
import type { Event } from "../structures/event.structure.js";

import { findFiles } from "../utils/file-discovery.js";
import { logger } from "../utils/logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CORE_EVENTS_DIR = join(
    __dirname,
    "..",
    "events",
);

const MODULES_DIR = join(
    __dirname,
    "..",
    "..",
    "modules",
);

const EVENT_FILE_PATTERN = /\.event\.(ts|js)$/;

type RuntimeEvent = {
    name: string;
    once?: boolean;
    execute: (
        bot: Bot,
        ...args: any[]
    ) => Promise<void> | void;
};

export async function loadEvents(
    bot: Bot,
): Promise<void> {
    const eventFiles = [
        ...findFiles(
        CORE_EVENTS_DIR,
        EVENT_FILE_PATTERN,
        ),
        ...findFiles(
        MODULES_DIR,
        EVENT_FILE_PATTERN,
        ),
    ];

    let loadedCount = 0;

    for (const filePath of eventFiles) {
        try {
            const imported = await import(
                pathToFileURL(filePath).href
            );

            const event: unknown = imported.default;

            if (!isValidEvent(event)) {
                logger.warn(
                    `Pominięto niepoprawny event: ${filePath}`,
                );

                continue;
            }

            const runtimeEvent =
                event as RuntimeEvent;

            const listener = (...args: any[]) =>
                runtimeEvent.execute(
                bot,
                ...args,
                );

            if (runtimeEvent.once) {
                bot.once(
                runtimeEvent.name,
                listener,
                );
            } else {
                bot.on(
                runtimeEvent.name,
                listener,
                );
            }

            loadedCount++;
        } catch (error) {
            logger.error(
                `Błąd ładowania eventu (${filePath}):`,
                error,
            );
        }
    }

    logger.info(
        `Załadowano ${loadedCount} eventów`,
    );
}

function isValidEvent(
  event: unknown,
): event is Event {
  if (
    typeof event !== "object" ||
    event === null
  ) {
    return false;
  }

  const candidate =
    event as Partial<Event>;

  return (
    typeof candidate.name === "string" &&
    typeof candidate.execute === "function" &&
    (
      candidate.once === undefined ||
      typeof candidate.once === "boolean"
    )
  );
}