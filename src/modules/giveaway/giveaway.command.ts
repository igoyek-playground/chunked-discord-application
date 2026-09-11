import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
} from "discord.js";

import type { Bot } from "../../core/bot.js";
import type { GiveawayCommandError } from "./giveaway.controller.js";

import { defineCommand } from "../../core/structures/command.structure.js";
import { giveawayConfig } from "../../../config/modules/giveaway.config.js";
import { GiveawayController } from "./giveaway.controller.js";
import { GiveawayDurationUtil } from "./giveaway-duration.util.js";

const TARGET_CHANNEL_TYPES = [
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
] as const;

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Zarządzanie konkursami.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("start")
                .setDescription("Tworzy nowy konkurs.")
                .addStringOption((option) =>
                    option
                        .setName("nagroda")
                        .setDescription(
                            "Nagroda do wygrania w konkursie.",
                        )
                        .setMaxLength(256)
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("ilosc_zwyciezcow")
                        .setDescription(
                            "Ilu zwycięzców zostanie wylosowanych.",
                        )
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("czas")
                        .setDescription(
                            "Czas trwania konkursu, np. 1h, 2d, 1d12h.",
                        )
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("kanal")
                        .setDescription(
                            "Kanał, na który zostanie wysłany konkurs (domyślnie ten, na którym użyto komendy).",
                        )
                        .addChannelTypes(
                            ...TARGET_CHANNEL_TYPES,
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("force-stop")
                .setDescription(
                    "Kończy konkurs natychmiast i wyznacza zwycięzców.",
                )
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("ID konkursu.")
                        .setMinLength(6)
                        .setMaxLength(6)
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("cancel")
                .setDescription(
                    "Anuluje konkurs bez wyznaczania zwycięzców.",
                )
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("ID konkursu.")
                        .setMinLength(6)
                        .setMaxLength(6)
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("reroll")
                .setDescription(
                    "Losuje dodatkowych zwycięzców zakończonego konkursu.",
                )
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("ID konkursu.")
                        .setMinLength(6)
                        .setMaxLength(6)
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("ilosc")
                        .setDescription(
                            "Ile dodatkowych osób wylosować.",
                        )
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("set-time")
                .setDescription(
                    "Nadpisuje czas do końca konkursu.",
                )
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("ID konkursu.")
                        .setMinLength(6)
                        .setMaxLength(6)
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("czas")
                        .setDescription(
                            "Nowy czas do końca, np. 1h, 2d, 1d12h.",
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("set-winners")
                .setDescription(
                    "Zmienia liczbę zwycięzców trwającego konkursu.",
                )
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("ID konkursu.")
                        .setMinLength(6)
                        .setMaxLength(6)
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("ilosc_zwyciezcow")
                        .setDescription(
                            "Nowa liczba zwycięzców.",
                        )
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true),
                ),
        ),

    userPermissions: [
        PermissionFlagsBits[giveawayConfig.managePermission],
    ],

    async execute(interaction, bot) {
        if (
            !interaction.inGuild() ||
            !interaction.guild
        ) {
            return;
        }

        const subcommand =
            interaction.options.getSubcommand();

        switch (subcommand) {
            case "start":
                await handleStart(interaction);
                return;

            case "force-stop":
                await handleForceStop(interaction, bot);
                return;

            case "cancel":
                await handleCancel(interaction, bot);
                return;

            case "reroll":
                await handleReroll(interaction, bot);
                return;

            case "set-time":
                await handleSetTime(interaction);
                return;

            case "set-winners":
                await handleSetWinners(interaction);
                return;
        }
    },
});

async function handleStart(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (!interaction.inGuild() || !interaction.guild) {
        return;
    }

    const prize = interaction.options.getString(
        "nagroda",
        true,
    );

    const winnerCount = interaction.options.getInteger(
        "ilosc_zwyciezcow",
        true,
    );

    const durationInput = interaction.options.getString(
        "czas",
        true,
    );

    const durationMs =
        GiveawayDurationUtil.parse(durationInput);

    if (durationMs === null) {
        await interaction.reply({
            content:
                giveawayConfig.messages.invalidDuration,
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    const selectedChannel = interaction.options.getChannel(
        "kanal",
        false,
        TARGET_CHANNEL_TYPES,
    );

    const channel = selectedChannel ?? interaction.channel;

    if (
        !channel ||
        (channel.type !== ChannelType.GuildText &&
            channel.type !== ChannelType.GuildAnnouncement)
    ) {
        await interaction.reply({
            content:
                giveawayConfig.messages.cannotSendToChannel,
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    const giveaway = await GiveawayController.start(channel, {
        guildId: interaction.guild.id,
        channelId: channel.id,
        hostId: interaction.user.id,
        prize,
        winnerCount,
        endsAt: new Date(Date.now() + durationMs),
    });

    await interaction.reply({
        content: giveawayConfig.messages.started
            .replaceAll("{ID}", giveaway.id)
            .replaceAll("{CHANNEL}", `<#${channel.id}>`),
        flags: MessageFlags.Ephemeral,
    });
}

async function handleForceStop(
    interaction: ChatInputCommandInteraction,
    bot: Bot,
): Promise<void> {
    const id = interaction.options.getString("id", true);

    const error = await GiveawayController.forceStop(bot, id);

    if (error) {
        await interaction.reply(
            buildErrorReply(error),
        );

        return;
    }

    await interaction.reply({
        content: giveawayConfig.messages.forceStopped.replaceAll(
            "{ID}",
            id,
        ),
        flags: MessageFlags.Ephemeral,
    });
}

async function handleCancel(
    interaction: ChatInputCommandInteraction,
    bot: Bot,
): Promise<void> {
    const id = interaction.options.getString("id", true);

    const error = await GiveawayController.cancel(bot, id);

    if (error) {
        await interaction.reply(
            buildErrorReply(error),
        );

        return;
    }

    await interaction.reply({
        content:
            giveawayConfig.messages.cancelled.replaceAll(
                "{ID}",
                id,
            ),
        flags: MessageFlags.Ephemeral,
    });
}

async function handleReroll(
    interaction: ChatInputCommandInteraction,
    bot: Bot,
): Promise<void> {
    const id = interaction.options.getString("id", true);

    const count = interaction.options.getInteger(
        "ilosc",
        true,
    );

    const result = await GiveawayController.reroll(
        bot,
        id,
        count,
    );

    if (result.error) {
        await interaction.reply(
            buildErrorReply(result.error),
        );

        return;
    }

    if (result.newWinnerIds.length === 0) {
        await interaction.reply({
            content:
                giveawayConfig.messages.rerollNoEligibleUsers,
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    await interaction.reply({
        content: giveawayConfig.messages.rerollSuccess
            .replaceAll("{ID}", id)
            .replaceAll(
                "{COUNT}",
                String(result.newWinnerIds.length),
            ),
        flags: MessageFlags.Ephemeral,
    });
}

async function handleSetTime(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const id = interaction.options.getString("id", true);

    const durationInput = interaction.options.getString(
        "czas",
        true,
    );

    const durationMs =
        GiveawayDurationUtil.parse(durationInput);

    if (durationMs === null) {
        await interaction.reply({
            content:
                giveawayConfig.messages.invalidDuration,
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    const endsAt = new Date(Date.now() + durationMs);

    const error = await GiveawayController.setTime(
        id,
        endsAt,
    );

    if (error) {
        await interaction.reply(
            buildErrorReply(error),
        );

        return;
    }

    const endsAtSeconds = Math.floor(
        endsAt.getTime() / 1000,
    );

    await interaction.reply({
        content: giveawayConfig.messages.timeUpdated
            .replaceAll("{ID}", id)
            .replaceAll(
                "{TIME}",
                `<t:${endsAtSeconds}:R>`,
            ),
        flags: MessageFlags.Ephemeral,
    });
}

async function handleSetWinners(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const id = interaction.options.getString("id", true);

    const winnerCount = interaction.options.getInteger(
        "ilosc_zwyciezcow",
        true,
    );

    const error = await GiveawayController.setWinnerCount(
        id,
        winnerCount,
    );

    if (error) {
        await interaction.reply(
            buildErrorReply(error),
        );

        return;
    }

    await interaction.reply({
        content: giveawayConfig.messages.winnersUpdated
            .replaceAll("{ID}", id)
            .replaceAll("{COUNT}", String(winnerCount)),
        flags: MessageFlags.Ephemeral,
    });
}

function buildErrorReply(error: GiveawayCommandError): {
    content: string;
    flags: MessageFlags.Ephemeral;
} {
    if (error === "not-found") {
        return {
            content:
                giveawayConfig.messages.giveawayNotFound,
            flags: MessageFlags.Ephemeral,
        };
    }

    if (error === "not-ended") {
        return {
            content:
                giveawayConfig.messages.giveawayNotEnded,
            flags: MessageFlags.Ephemeral,
        };
    }

    return {
        content: giveawayConfig.messages.giveawayNotActive,
        flags: MessageFlags.Ephemeral,
    };
}
