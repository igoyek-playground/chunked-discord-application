import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    MessageFlags,
    resolveColor,
    type ColorResolvable,
    type User,
} from "discord.js";

import { defineCommand } from "../../../core/structures/command.structure.js";
import { logger } from "../../../core/utils/logger.js";
import { AvatarColorUtil } from "./avatar-color.util.js";

const DEFAULT_COLOR = "#5865F2" as const;
const DISPLAY_SIZE = 1024;
const SAMPLE_SIZE = 128;

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Wyświetla avatar użytkownika.")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription(
                    "Użytkownik, którego avatar chcesz zobaczyć (domyślnie Ty).",
                )
                .setRequired(false),
        ),

    async execute(interaction) {
        const targetUser =
            interaction.options.getUser("user") ??
            interaction.user;

        const member = interaction.inGuild()
            ? await interaction.guild?.members
                  .fetch(targetUser.id)
                  .catch(() => null)
            : null;

        const avatarOwner = member ?? targetUser;

        const displayUrl = avatarOwner.displayAvatarURL({
            size: DISPLAY_SIZE,
            extension: "png",
        });

        const sampleUrl = avatarOwner.displayAvatarURL({
            size: SAMPLE_SIZE,
            extension: "png",
            forceStatic: true,
        });

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const color = await resolveEmbedColor(
            sampleUrl,
            targetUser,
        );

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({
                name: `Avatar użytkownika ${targetUser.tag}`,
                iconURL: avatarOwner.displayAvatarURL({
                    size: 64,
                }),
            })
            .setImage(displayUrl);

        const openButton = new ButtonBuilder()
            .setLabel("Otwórz w przeglądarce")
            .setStyle(ButtonStyle.Link)
            .setURL(displayUrl);

        await interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    openButton,
                ),
            ],
        });
    },
});

async function resolveEmbedColor(
    sampleUrl: string,
    targetUser: User,
): Promise<ColorResolvable> {
    try {
        const dominant =
            await AvatarColorUtil.extractDominantColor(
                sampleUrl,
            );

        return resolveColor(dominant);
    } catch (error) {
        logger.warn(
            `Nie udało się wyznaczyć koloru avatara ${targetUser.id}, ` +
                `próbuję koloru akcentu profilu (${
                    error instanceof Error
                        ? error.message
                        : String(error)
                })`,
        );
    }

    try {
        const fullUser = await targetUser.fetch(true);

        if (fullUser.accentColor) {
            return resolveColor(fullUser.accentColor);
        }
    } catch (error) {
        logger.warn(
            `Nie udało się pobrać koloru akcentu profilu ${targetUser.id}:`,
        );
        logger.error("", error);
    }

    return resolveColor(DEFAULT_COLOR);
}