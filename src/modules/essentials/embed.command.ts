import {
    ChannelType,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    resolveColor,
    type APIEmbed,
    type ChatInputCommandInteraction,
    type GuildTextBasedChannel,
    type HexColorString,
    type SlashCommandSubcommandBuilder,
} from "discord.js";

import { defineCommand } from "../../core/structures/command.structure.js";
import { logger } from "../../core/utils/logger.js";

const DEFAULT_COLOR: HexColorString = "#5865F2";
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const MAX_FIELDS = 3;

const TARGET_CHANNEL_TYPES = [
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
] as const;

function addAppearanceOptions(
    subcommand: SlashCommandSubcommandBuilder,
): SlashCommandSubcommandBuilder {
    subcommand
        .addStringOption((option) =>
            option
                .setName("color")
                .setDescription(
                    `Kolor paska embeda w formacie HEX, np. ${DEFAULT_COLOR}.`,
                )
                .setMaxLength(7)
                .setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("url")
                .setDescription("Adres URL, do którego prowadzi tytuł embeda.")
                .setRequired(false),
        )
        .addAttachmentOption((option) =>
            option
                .setName("image")
                .setDescription("Duży obrazek wyświetlany na dole embeda.")
                .setRequired(false),
        )
        .addAttachmentOption((option) =>
            option
                .setName("thumbnail")
                .setDescription(
                    "Mała miniaturka wyświetlana w prawym górnym rogu embeda.",
                )
                .setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("author_name")
                .setDescription("Nazwa wyświetlana nad tytułem embeda.")
                .setMaxLength(256)
                .setRequired(false),
        )
        .addAttachmentOption((option) =>
            option
                .setName("author_icon")
                .setDescription("Ikona wyświetlana obok nazwy autora.")
                .setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("footer_text")
                .setDescription("Tekst wyświetlany w stopce embeda.")
                .setMaxLength(2048)
                .setRequired(false),
        )
        .addAttachmentOption((option) =>
            option
                .setName("footer_icon")
                .setDescription("Ikona wyświetlana obok tekstu stopki.")
                .setRequired(false),
        )
        .addBooleanOption((option) =>
            option
                .setName("timestamp")
                .setDescription(
                    "Czy ustawić w embedzie aktualną datę i godzinę.",
                )
                .setRequired(false),
        );

    for (let index = 1; index <= MAX_FIELDS; index++) {
        subcommand
            .addStringOption((option) =>
                option
                    .setName(`field${index}_name`)
                    .setDescription(`Nazwa pola nr ${index}.`)
                    .setMaxLength(256)
                    .setRequired(false),
            )
            .addStringOption((option) =>
                option
                    .setName(`field${index}_value`)
                    .setDescription(`Wartość pola nr ${index}.`)
                    .setMaxLength(1024)
                    .setRequired(false),
            )
            .addBooleanOption((option) =>
                option
                    .setName(`field${index}_inline`)
                    .setDescription(
                        `Czy pole nr ${index} ma być wyświetlone w linii.`,
                    )
                    .setRequired(false),
            );
    }

    return subcommand;
}

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Zaawansowane narzędzie do tworzenia i edycji embedów.")
        .addSubcommand((subcommand) =>
            addAppearanceOptions(
                subcommand
                    .setName("create")
                    .setDescription("Tworzy i wysyła nowy embed.")
                    .addStringOption((option) =>
                        option
                            .setName("title")
                            .setDescription("Tytuł embeda.")
                            .setMaxLength(256)
                            .setRequired(true),
                    )
                    .addStringOption((option) =>
                        option
                            .setName("description")
                            .setDescription("Treść (opis) embeda.")
                            .setMaxLength(4096)
                            .setRequired(true),
                    )
                    .addChannelOption((option) =>
                        option
                            .setName("channel")
                            .setDescription(
                                "Kanał docelowy. Domyślnie kanał bieżący.",
                            )
                            .addChannelTypes(...TARGET_CHANNEL_TYPES)
                            .setRequired(false),
                    ),
            ),
        )
        .addSubcommand((subcommand) =>
            addAppearanceOptions(
                subcommand
                    .setName("edit")
                    .setDescription(
                        "Edytuje embed wcześniej wysłany przez bota — zmienia tylko podane pola.",
                    )
                    .addStringOption((option) =>
                        option
                            .setName("message_id")
                            .setDescription("ID wiadomości bota do edycji.")
                            .setRequired(true),
                    )
                    .addChannelOption((option) =>
                        option
                            .setName("channel")
                            .setDescription(
                                "Kanał, na którym znajduje się wiadomość. Domyślnie kanał bieżący.",
                            )
                            .addChannelTypes(...TARGET_CHANNEL_TYPES)
                            .setRequired(false),
                    )
                    .addStringOption((option) =>
                        option
                            .setName("title")
                            .setDescription("Nowy tytuł embeda.")
                            .setMaxLength(256)
                            .setRequired(false),
                    )
                    .addStringOption((option) =>
                        option
                            .setName("description")
                            .setDescription("Nowa treść (opis) embeda.")
                            .setMaxLength(4096)
                            .setRequired(false),
                    ),
            ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("json")
                .setDescription(
                    "Wysyła (lub edytuje) embed na podstawie surowego JSON-a.",
                )
                .addStringOption((option) =>
                    option
                        .setName("json")
                        .setDescription(
                            "Treść embeda w formacie JSON (schemat Discorda).",
                        )
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription(
                            "Kanał docelowy. Domyślnie kanał bieżący.",
                        )
                        .addChannelTypes(...TARGET_CHANNEL_TYPES)
                        .setRequired(false),
                )
                .addStringOption((option) =>
                    option
                        .setName("message_id")
                        .setDescription(
                            "ID wiadomości bota do edycji. Jeśli pominięte, wysyłana jest nowa wiadomość.",
                        )
                        .setRequired(false),
                ),
        ),

    userPermissions: [PermissionFlagsBits.ManageMessages],
    botPermissions: [PermissionFlagsBits.EmbedLinks],

    async execute(interaction) {
        if (!interaction.inGuild() || !interaction.guild) {
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "create") {
            await handleCreate(interaction);

            return;
        }

        if (subcommand === "edit") {
            await handleEdit(interaction);

            return;
        }

        if (subcommand === "json") {
            await handleJson(interaction);
        }
    },
});

async function handleCreate(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const channel = resolveTargetChannel(interaction);

    if (!channel) {
        await replyError(
            interaction,
            "Nie można wysłać embeda na tym kanale.",
        );

        return;
    }

    const colorInput = interaction.options.getString("color", false);

    if (!isValidColorInput(colorInput)) {
        await replyError(
            interaction,
            `Niepoprawny format koloru: \`${colorInput}\`. Użyj formatu HEX, np. \`${DEFAULT_COLOR}\`.`,
        );

        return;
    }

    const embed = new EmbedBuilder()
        .setTitle(interaction.options.getString("title", true))
        .setDescription(interaction.options.getString("description", true))
        .setColor(resolveColor((colorInput ?? DEFAULT_COLOR) as HexColorString));

    applyAppearanceOptions(interaction, embed);

    try {
        await channel.send({
            embeds: [embed],
        });

        await interaction.reply({
            content: `\`[ ✔ \`] Embed został wysłany na ${channel}.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error("Błąd podczas wysyłania embeda:", error);

        await replyError(
            interaction,
            `\`[ ✘ \`] Nie udało się wysłać embeda. Sprawdź uprawnienia bota na docelowym kanale.`,
        );
    }
}

async function handleEdit(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const channel = resolveTargetChannel(interaction);

    if (!channel) {
        await replyError(
            interaction,
            `\`[ ✘ \`] Nie można edytować wiadomości na tym kanale.`,
        );

        return;
    }

    const colorInput = interaction.options.getString("color", false);

    if (!isValidColorInput(colorInput)) {
        await replyError(
            interaction,
            `\`[ ✘ \`] Niepoprawny format koloru: \`${colorInput}\`. Użyj formatu HEX, np. \`${DEFAULT_COLOR}\`.`,
        );

        return;
    }

    const messageId = interaction.options.getString("message_id", true);
    const message = await fetchEditableMessage(interaction, channel, messageId);

    if (!message) {
        return;
    }

    const embed = new EmbedBuilder(message.embeds[0]?.toJSON() ?? {});

    const title = interaction.options.getString("title", false);
    const description = interaction.options.getString("description", false);

    if (title) {
        embed.setTitle(title);
    }

    if (description) {
        embed.setDescription(description);
    }

    if (colorInput) {
        embed.setColor(resolveColor(colorInput as HexColorString));
    }

    applyAppearanceOptions(interaction, embed);

    try {
        await message.edit({
            embeds: [embed],
        });

        await interaction.reply({
            content: `\`[ ✔ \`] Embed na ${channel} został zaktualizowany.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error("Błąd podczas edycji embeda:", error);

        await replyError(
            interaction,
            `\`[ ✘ \`] Nie udało się zaktualizować embeda. Sprawdź, czy podane dane są poprawne.`,
        );
    }
}

async function handleJson(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const channel = resolveTargetChannel(interaction);

    if (!channel) {
        await replyError(
            interaction,
            `\`[ ✘ \`] Nie można wysłać embeda na tym kanale.`,
        );

        return;
    }

    const rawJson = interaction.options.getString("json", true);
    let parsed: APIEmbed;

    try {
        parsed = JSON.parse(rawJson) as APIEmbed;
    } catch {
        await replyError(
            interaction,
            `\`[ ✘ \`] Podany tekst nie jest poprawnym JSON-em.`,
        );

        return;
    }

    let embed: EmbedBuilder;

    try {
        embed = new EmbedBuilder(parsed);
    } catch {
        await replyError(
            interaction,
            `\`[ ✘ \`] Podany JSON nie odpowiada schematowi embeda Discorda.`,
        );

        return;
    }

    const messageId = interaction.options.getString("message_id", false);

    try {
        if (messageId) {
            const message = await fetchEditableMessage(
                interaction,
                channel,
                messageId,
            );

            if (!message) {
                return;
            }

            await message.edit({
                embeds: [embed],
            });

            await interaction.reply({
                content: `\`[ ✔ \`] Embed na ${channel} został zaktualizowany.`,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        await channel.send({
            embeds: [embed],
        });

        await interaction.reply({
            content: `\`[ ✔ \`] Embed został wysłany na ${channel}.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error("Błąd podczas przetwarzania embeda z JSON-a:", error);

        await replyError(
            interaction,
            `\`[ ✘ \`] Discord odrzucił ten embed — sprawdź, czy JSON jest poprawny i mieści się w limitach embedów.`,
        );
    }
}

function applyAppearanceOptions(
    interaction: ChatInputCommandInteraction,
    embed: EmbedBuilder,
): void {
    const url = interaction.options.getString("url", false);
    const authorName = interaction.options.getString("author_name", false);
    const authorIcon = interaction.options.getAttachment("author_icon", false);
    const footerText = interaction.options.getString("footer_text", false);
    const footerIcon = interaction.options.getAttachment("footer_icon", false);
    const image = interaction.options.getAttachment("image", false);
    const thumbnail = interaction.options.getAttachment("thumbnail", false);
    const includeTimestamp = interaction.options.getBoolean("timestamp", false);

    if (url) {
        embed.setURL(url);
    }

    if (authorName) {
        embed.setAuthor({
            name: authorName,
            iconURL: authorIcon?.url,
        });
    }

    if (footerText) {
        embed.setFooter({
            text: footerText,
            iconURL: footerIcon?.url,
        });
    }

    if (image) {
        embed.setImage(image.url);
    }

    if (thumbnail) {
        embed.setThumbnail(thumbnail.url);
    }

    if (includeTimestamp) {
        embed.setTimestamp();
    }

    const fields = parseFields(interaction);

    if (fields.length > 0) {
        embed.setFields(fields);
    }
}

function parseFields(
    interaction: ChatInputCommandInteraction,
): { name: string; value: string; inline: boolean }[] {
    const fields: { name: string; value: string; inline: boolean }[] = [];

    for (let index = 1; index <= MAX_FIELDS; index++) {
        const name = interaction.options.getString(`field${index}_name`, false);
        const value = interaction.options.getString(`field${index}_value`, false);

        const inline =
            interaction.options.getBoolean(`field${index}_inline`, false) ??
            false;

        if (name && value) {
            fields.push({ name, value, inline });
        }
    }

    return fields;
}

function resolveTargetChannel(
    interaction: ChatInputCommandInteraction,
): GuildTextBasedChannel | null {
    const selectedChannel = interaction.options.getChannel(
        "channel",
        false,
        TARGET_CHANNEL_TYPES,
    );

    const channel = selectedChannel ?? interaction.channel;

    if (
        !channel ||
        (
            channel.type !== ChannelType.GuildText &&
            channel.type !== ChannelType.GuildAnnouncement
        )
    ) {
        return null;
    }

    return channel;
}

async function fetchEditableMessage(
    interaction: ChatInputCommandInteraction,
    channel: GuildTextBasedChannel,
    messageId: string,
) {
    try {
        const message = await channel.messages.fetch(messageId);

        if (message.author.id !== interaction.client.user.id) {
            await replyError(
                interaction,
                `\`[ ✘ \`] Mogę edytować wyłącznie wiadomości wysłane przeze mnie.`,
            );

            return null;
        }

        return message;
    } catch (error) {
        logger.debug(
            `Nie znaleziono wiadomości do edycji (${messageId}): ${
                error instanceof Error ? error.message : String(error)
            }`,
        );

        await replyError(
            interaction,
            `\`[ ✘ \`] Nie znaleziono wiadomości o podanym ID na tym kanale.`,
        );

        return null;
    }
}

function isValidColorInput(
    colorInput: string | null,
): boolean {
    return !colorInput || HEX_COLOR_PATTERN.test(colorInput);
}

async function replyError(
    interaction: ChatInputCommandInteraction,
    content: string,
): Promise<void> {
    await interaction.reply({
        content,
        flags: MessageFlags.Ephemeral,
    });
}