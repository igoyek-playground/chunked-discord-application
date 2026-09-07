import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
} from "discord.js";

import { defineCommand } from "../../core/structures/command.structure.js";
import { verificationConfig } from "../../../config/modules/verification.config.js";
import { logger } from "../../core/utils/logger.js";
import { VerificationController } from "./verification.controller.js";

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("verification")
        .setDescription(
            "Zarządzanie systemem weryfikacji.",
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("send-panel")
                .setDescription(
                    "Wysyła panel weryfikacji na wybranym kanale.",
                )
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription(
                            "Kanał, na który ma zostać wysłany panel.",
                        )
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.GuildAnnouncement,
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("force")
                .setDescription(
                    "Weryfikuje użytkownika natychmiastowo, bez kodu.",
                )
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription(
                            "Użytkownik do zweryfikowania.",
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove-limit")
                .setDescription(
                    "Usuwa blokadę nałożoną po błędnych próbach weryfikacji.",
                )
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription(
                            "Użytkownik, któremu ma zostać usunięta blokada.",
                        )
                        .setRequired(true),
                ),
        ),

    userPermissions: [
        PermissionFlagsBits.ManageGuild,
    ],

    async execute(interaction) {
        if (!verificationConfig.enabled) {
            await interaction.reply({
                content:
                    verificationConfig.messages.disabled,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        if (
            !interaction.inGuild() ||
            !interaction.guild
        ) {
            return;
        }

        const subcommand =
            interaction.options.getSubcommand();

        if (subcommand === "send-panel") {
            await handleSendPanel(interaction);

            return;
        }

        if (subcommand === "force") {
            await handleForce(interaction);

            return;
        }

        if (subcommand === "remove-limit") {
            await handleRemoveLimit(interaction);
        }
    },
});

async function handleSendPanel(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (
        !interaction.inGuild() ||
        !interaction.guild
    ) {
        return;
    }

    const selectedChannel =
        interaction.options.getChannel(
            "channel",
            false,
            [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
            ],
        );

    const channel =
        selectedChannel ?? interaction.channel;

    if (
        !channel ||
        (
            channel.type !== ChannelType.GuildText &&
            channel.type !== ChannelType.GuildAnnouncement
        )
    ) {
        await interaction.reply({
            content:
                "Nie można wysłać panelu na tym kanale.",
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    await VerificationController.sendPanel(channel);

    await interaction.reply({
        content:
            `Panel weryfikacji został wysłany na <#${channel.id}>.`,
        flags: MessageFlags.Ephemeral,
    });
}

async function handleForce(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (
        !interaction.inGuild() ||
        !interaction.guild
    ) {
        return;
    }

    const targetUser =
        interaction.options.getUser(
            "user",
            true,
        );

    const member =
        interaction.guild.members.cache.get(
            targetUser.id,
        ) ??
        await interaction.guild.members.fetch(
            targetUser.id,
        );

    try {
        await VerificationController.forceVerify(
            interaction.guild,
            member,
        );

        await interaction.reply({
            content:
                verificationConfig.messages.forceVerified.replace(
                    "{USER}",
                    `${targetUser}`,
                ),
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error(
            "Błąd podczas ręcznej weryfikacji użytkownika:",
            error,
        );

        await interaction.reply({
            content:
                VerificationController.resolveGrantErrorMessage(
                    error,
                ),
            flags: MessageFlags.Ephemeral,
        });
    }
}

async function handleRemoveLimit(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (
        !interaction.inGuild() ||
        !interaction.guild
    ) {
        return;
    }

    const targetUser =
        interaction.options.getUser(
            "user",
            true,
        );

    VerificationController.removeLimit(
        interaction.guild.id,
        targetUser.id,
    );

    await interaction.reply({
        content:
            verificationConfig.messages.limitRemoved.replace(
                "{USER}",
                `${targetUser}`,
            ),
        flags: MessageFlags.Ephemeral,
    });
}