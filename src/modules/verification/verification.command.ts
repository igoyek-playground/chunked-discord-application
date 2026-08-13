import {
    ChannelType,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";

import { defineCommand } from "../../core/structures/command.structure.js";
import { verificationConfig } from "../../../config/modules/verification.config.js";
import { VerificationController } from "./verification.controller.js";
import { VerificationUiService } from "./verification-ui.service.js";

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("verification-panel")
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

    userPermissions: [
        PermissionFlagsBits.ManageGuild,
    ],

    async execute(interaction) {
        if (!verificationConfig.enabled) {
            await interaction.reply(
                VerificationUiService.createEphemeralMessage(
                    verificationConfig.messages.disabled,
                ),
            );

            return;
        }

        if (!interaction.inGuild()) {
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
            await interaction.reply(
                VerificationUiService.createEphemeralMessage(
                    "Nie można wysłać panelu na tym kanale.",
                ),
            );

            return;
        }

        await VerificationController.sendPanel(channel);

        await interaction.reply(
            VerificationUiService.createEphemeralMessage(
                `Panel weryfikacji został wysłany na <#${channel.id}>.`,
            ),
        );
    },
});