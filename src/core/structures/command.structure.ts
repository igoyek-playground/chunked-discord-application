import type {
    ChatInputCommandInteraction,
    PermissionResolvable,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import type { Bot } from "../bot.js";

export type SlashCommandData =
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

export interface Command {
    data: SlashCommandData;

    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];

    execute: (
        interaction: ChatInputCommandInteraction,
        bot: Bot,
    ) => Promise<void> | void;
}

export function defineCommand(command: Command): Command {
    return command;
}
