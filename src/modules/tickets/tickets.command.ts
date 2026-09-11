import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
} from "discord.js";

import { defineCommand } from "../../core/structures/command.structure.js";
import { ticketsConfig } from "../../../config/modules/tickets.config.js";
import { TicketsController } from "./tickets.controller.js";

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("tickets")
        .setDescription("Zarządzanie systemem ticketów.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("send-panel")
                .setDescription(
                    "Wysyła panel wyboru kategorii ticketów na wybranym kanale.",
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
        ),

    userPermissions: [PermissionFlagsBits.ManageGuild],

    async execute(interaction) {
        if (!ticketsConfig.enabled) {
            await interaction.reply({
                content: ticketsConfig.messages.disabled,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        if (!interaction.inGuild() || !interaction.guild) {
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "send-panel") {
            await handleSendPanel(interaction);
        }
    },
});

async function handleSendPanel(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (!interaction.inGuild() || !interaction.guild) {
        return;
    }

    const selectedChannel = interaction.options.getChannel(
        "channel",
        false,
        [ChannelType.GuildText, ChannelType.GuildAnnouncement],
    );

    const channel = selectedChannel ?? interaction.channel;

    if (
        !channel ||
        (channel.type !== ChannelType.GuildText &&
            channel.type !== ChannelType.GuildAnnouncement)
    ) {
        await interaction.reply({
            content: "\`[ ✘ ]\`Nie można wysłać panelu na tym kanale.",
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    await TicketsController.sendPanel(channel);

    await interaction.reply({
        content: "\`[ ✔ ]\`Panel ticketów został wysłany na <#${channel.id}>.",
        flags: MessageFlags.Ephemeral,
    });
}
