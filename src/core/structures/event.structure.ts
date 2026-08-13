import type { ClientEvents } from "discord.js";
import type { Bot } from "../bot.js";

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
    name: K;
    once?: boolean;

    execute: (bot: Bot, ...args: ClientEvents[K]) => Promise<void> | void;
}

export function defineEvent<K extends keyof ClientEvents>(event: Event<K>): Event<K> {
    return event;
}
