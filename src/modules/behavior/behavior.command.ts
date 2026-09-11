import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type User,
} from "discord.js";

import { defineCommand } from "../../core/structures/command.structure.js";
import { logger } from "../../core/utils/logger.js";
import { BehaviorVoiceService } from "./behavior-voice.service.js";
import { BehaviorWebhookService } from "./behavior-webhook.service.js";

const TEXT_CHANNEL_TYPES = [
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
] as const;

const VOICE_CHANNEL_TYPES = [
    ChannelType.GuildVoice,
    ChannelType.GuildStageVoice,
] as const;

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_TYPING_SECONDS = 120;
const TYPING_REFRESH_MS = 8_000; // wskaźnik "pisze..." wygasa po ~10s

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("behavior")
        .setDescription(
            "Zachowania bota — wysyłanie wiadomości, DM-y, kanały głosowe.",
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("say")
                .setDescription(
                    "Wysyła wiadomość jako bot.",
                )
                .addStringOption((option) =>
                    option
                        .setName("wiadomosc")
                        .setDescription(
                            "Treść wiadomości do wysłania.",
                        )
                        .setMaxLength(MAX_MESSAGE_LENGTH)
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("kanal")
                        .setDescription(
                            "Kanał docelowy (domyślnie bieżący).",
                        )
                        .addChannelTypes(
                            ...TEXT_CHANNEL_TYPES,
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("reply")
                .setDescription(
                    "Odpowiada na wskazaną wiadomość jako bot.",
                )
                .addStringOption((option) =>
                    option
                        .setName("id_wiadomosci")
                        .setDescription(
                            "ID wiadomości, na którą ma odpowiedzieć bot.",
                        )
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("wiadomosc")
                        .setDescription(
                            "Treść odpowiedzi.",
                        )
                        .setMaxLength(MAX_MESSAGE_LENGTH)
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("kanal")
                        .setDescription(
                            "Kanał, na którym znajduje się wiadomość (domyślnie bieżący).",
                        )
                        .addChannelTypes(
                            ...TEXT_CHANNEL_TYPES,
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("dm")
                .setDescription(
                    "Wysyła wiadomość prywatną do danego użytkownika.",
                )
                .addUserOption((option) =>
                    option
                        .setName("uzytkownik")
                        .setDescription(
                            "Odbiorca wiadomości.",
                        )
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("wiadomosc")
                        .setDescription(
                            "Treść wiadomości.",
                        )
                        .setMaxLength(MAX_MESSAGE_LENGTH)
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("voice-join")
                .setDescription(
                    "Dołącza (lub przenosi się) na kanał głosowy.",
                )
                .addChannelOption((option) =>
                    option
                        .setName("kanal")
                        .setDescription(
                            "Docelowy kanał głosowy.",
                        )
                        .addChannelTypes(
                            ...VOICE_CHANNEL_TYPES,
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("voice-leave")
                .setDescription(
                    "Opuszcza obecny kanał głosowy.",
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("react")
                .setDescription(
                    "Dodaje reakcję do wskazanej wiadomości.",
                )
                .addStringOption((option) =>
                    option
                        .setName("id_wiadomosci")
                        .setDescription(
                            "ID wiadomości do zareagowania.",
                        )
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("emoji")
                        .setDescription(
                            "Emoji (np. 🎉 albo <:nazwa:id>).",
                        )
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("kanal")
                        .setDescription(
                            "Kanał, na którym znajduje się wiadomość (domyślnie bieżący).",
                        )
                        .addChannelTypes(
                            ...TEXT_CHANNEL_TYPES,
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("edit")
                .setDescription(
                    "Edytuje wcześniej wysłaną przez bota wiadomość.",
                )
                .addStringOption((option) =>
                    option
                        .setName("id_wiadomosci")
                        .setDescription(
                            "ID wiadomości bota do edycji.",
                        )
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("nowa_tresc")
                        .setDescription(
                            "Nowa treść wiadomości.",
                        )
                        .setMaxLength(MAX_MESSAGE_LENGTH)
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("kanal")
                        .setDescription(
                            "Kanał, na którym znajduje się wiadomość (domyślnie bieżący).",
                        )
                        .addChannelTypes(
                            ...TEXT_CHANNEL_TYPES,
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription(
                    "Usuwa dowolną wiadomość po ID.",
                )
                .addStringOption((option) =>
                    option
                        .setName("id_wiadomosci")
                        .setDescription(
                            "ID wiadomości do usunięcia.",
                        )
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("kanal")
                        .setDescription(
                            "Kanał, na którym znajduje się wiadomość (domyślnie bieżący).",
                        )
                        .addChannelTypes(
                            ...TEXT_CHANNEL_TYPES,
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("webhook-say")
                .setDescription(
                    "Wysyła wiadomość podszywając się pod dowolną nazwę/avatar (webhook).",
                )
                .addChannelOption((option) =>
                    option
                        .setName("kanal")
                        .setDescription(
                            "Kanał docelowy.",
                        )
                        .addChannelTypes(
                            ...TEXT_CHANNEL_TYPES,
                        )
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("nazwa")
                        .setDescription(
                            "Nazwa wyświetlana jako autor wiadomości.",
                        )
                        .setMaxLength(80)
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("wiadomosc")
                        .setDescription(
                            "Treść wiadomości.",
                        )
                        .setMaxLength(MAX_MESSAGE_LENGTH)
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("avatar_url")
                        .setDescription(
                            "Adres URL avatara (domyślnie avatar bota).",
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("typing")
                .setDescription(
                    "Wyświetla wskaźnik \"pisze...\" na kanale przez podany czas.",
                )
                .addIntegerOption((option) =>
                    option
                        .setName("sekundy")
                        .setDescription(
                            "Przez ile sekund bot ma \"pisać\".",
                        )
                        .setMinValue(1)
                        .setMaxValue(MAX_TYPING_SECONDS)
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("kanal")
                        .setDescription(
                            "Kanał docelowy (domyślnie bieżący).",
                        )
                        .addChannelTypes(
                            ...TEXT_CHANNEL_TYPES,
                        )
                        .setRequired(false),
                ),
        ),

    userPermissions: [PermissionFlagsBits.Administrator],

    async execute(interaction, bot) {
        if (!interaction.inGuild() || !interaction.guild) {
            return;
        }

        const subcommand =
            interaction.options.getSubcommand();

        switch (subcommand) {
            case "say":
                await handleSay(interaction);
                return;

            case "reply":
                await handleReply(interaction);
                return;

            case "dm":
                await handleDm(interaction);
                return;

            case "voice-join":
                await handleVoiceJoin(interaction);
                return;

            case "voice-leave":
                await handleVoiceLeave(interaction);
                return;

            case "react":
                await handleReact(interaction);
                return;

            case "edit":
                await handleEdit(interaction, bot.user?.id);
                return;

            case "delete":
                await handleDelete(interaction);
                return;

            case "webhook-say":
                await handleWebhookSay(interaction, bot.user);
                return;

            case "typing":
                await handleTyping(interaction);
                return;
        }
    },
});

async function handleSay(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (!interaction.inGuild()) {
        return;
    }

    const content = interaction.options.getString(
        "wiadomosc",
        true,
    );

    const selectedChannel = interaction.options.getChannel(
        "kanal",
        false,
        TEXT_CHANNEL_TYPES,
    );

    const channel = selectedChannel ?? interaction.channel;

    if (!channel || !channel.isTextBased()) {
        await interaction.reply({
            content:
                "Nie można wysłać wiadomości na tym kanale.",
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    try {
        await channel.send({ content });

        await interaction.reply({
            content: `\`[ ✔ \`] Wysłano wiadomość na <#${channel.id}>.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error(
            "Błąd podczas wysyłania wiadomości (/behavior say):",
            error,
        );

        await interaction.reply({
            content:
                "\`[ ✘ \`] Nie udało się wysłać wiadomości — sprawdź uprawnienia bota na tym kanale.",
            flags: MessageFlags.Ephemeral,
        });
    }
}

async function handleReply(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (!interaction.inGuild()) {
        return;
    }

    const messageId = interaction.options.getString(
        "id_wiadomosci",
        true,
    );

    const content = interaction.options.getString(
        "wiadomosc",
        true,
    );

    const selectedChannel = interaction.options.getChannel(
        "kanal",
        false,
        TEXT_CHANNEL_TYPES,
    );

    const channel = selectedChannel ?? interaction.channel;

    if (!channel || !channel.isTextBased()) {
        await interaction.reply({
            content:
                "\`[ ✘ \`] Nie można odpowiedzieć na wiadomość na tym kanale.",
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    try {
        const targetMessage = await channel.messages.fetch(
            messageId,
        );

        await targetMessage.reply({ content });

        await interaction.reply({
            content: `\`[ ✔ \`] Odpowiedziano na wiadomość \`${messageId}\` na <#${channel.id}>.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error(
            "Błąd podczas odpowiadania na wiadomość (/behavior reply):",
            error,
        );

        await interaction.reply({
            content:
                "\`[ ✘ \`] Nie znaleziono tej wiadomości na wskazanym kanale (albo bot nie ma tam uprawnień).",
            flags: MessageFlags.Ephemeral,
        });
    }
}

async function handleDm(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const targetUser = interaction.options.getUser(
        "uzytkownik",
        true,
    );

    const content = interaction.options.getString(
        "wiadomosc",
        true,
    );

    try {
        await targetUser.send({ content });

        await interaction.reply({
            content: `\`[ ✔ \`] Wysłano wiadomość prywatną do ${targetUser.tag}.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error(
            "Błąd podczas wysyłania DM (/behavior dm):",
            error,
        );

        await interaction.reply({
            content: `\`[ ✘ \`] Nie udało się wysłać wiadomości do ${targetUser.tag} — użytkownik może mieć zablokowane wiadomości prywatne.`,
            flags: MessageFlags.Ephemeral,
        });
    }
}

async function handleVoiceJoin(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const channel = interaction.options.getChannel(
        "kanal",
        true,
        VOICE_CHANNEL_TYPES,
    );

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
    });

    const result = await BehaviorVoiceService.join(channel);

    if (result.status === "error") {
        await interaction.editReply({
            content: `\`[ ✘ \`] ${result.message}`,
        });

        return;
    }

    const verb =
        result.status === "moved"
            ? "Przeniesiono się"
            : "Dołączono";

    await interaction.editReply({
        content: `\`[ ✔ \`] ${verb} na kanał <#${channel.id}>.`,
    });
}

async function handleVoiceLeave(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (!interaction.guild) {
        return;
    }

    const left = BehaviorVoiceService.leave(
        interaction.guild,
    );

    await interaction.reply({
        content: left
            ? `\`[ ✔ \`] Opuszczono kanał głosowy.`
            : `\`[ ✘ \`] Bot nie jest obecnie podłączony do żadnego kanału głosowego.`,
        flags: MessageFlags.Ephemeral,
    });
}

async function handleReact(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (!interaction.inGuild()) {
        return;
    }

    const messageId = interaction.options.getString(
        "id_wiadomosci",
        true,
    );

    const emoji = interaction.options.getString(
        "emoji",
        true,
    );

    const selectedChannel = interaction.options.getChannel(
        "kanal",
        false,
        TEXT_CHANNEL_TYPES,
    );

    const channel = selectedChannel ?? interaction.channel;

    if (!channel || !channel.isTextBased()) {
        await interaction.reply({
            content:
                `\`[ ✘ \`] Nie można zareagować na wiadomość na tym kanale.`,
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    try {
        const targetMessage = await channel.messages.fetch(
            messageId,
        );

        await targetMessage.react(emoji);

        await interaction.reply({
            content: `\`[ ✔ \`] Dodano reakcję do wiadomości \`${messageId}\`.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error(
            "Błąd podczas dodawania reakcji (/behavior react):",
            error,
        );

        await interaction.reply({
            content:
                `\`[ ✘ \`] Nie udało się dodać reakcji — sprawdź ID wiadomości, format emoji i uprawnienia bota.`,
            flags: MessageFlags.Ephemeral,
        });
    }
}

async function handleEdit(
    interaction: ChatInputCommandInteraction,
    botUserId: string | undefined,
): Promise<void> {
    if (!interaction.inGuild()) {
        return;
    }

    const messageId = interaction.options.getString(
        "id_wiadomosci",
        true,
    );

    const newContent = interaction.options.getString(
        "nowa_tresc",
        true,
    );

    const selectedChannel = interaction.options.getChannel(
        "kanal",
        false,
        TEXT_CHANNEL_TYPES,
    );

    const channel = selectedChannel ?? interaction.channel;

    if (!channel || !channel.isTextBased()) {
        await interaction.reply({
            content:
                `\`[ ✘ \`] Nie można edytować wiadomości na tym kanale.`,
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    try {
        const targetMessage = await channel.messages.fetch(
            messageId,
        );

        if (targetMessage.author.id !== botUserId) {
            await interaction.reply({
                content:
                    `\`[ ✘ \`] Bot może edytować tylko własne wiadomości (ograniczenie API Discorda).`,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        await targetMessage.edit({ content: newContent });

        await interaction.reply({
            content: `\`[ ✔ \`] Zedytowano wiadomość \`${messageId}\`.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error(
            "Błąd podczas edycji wiadomości (/behavior edit):",
            error,
        );

        await interaction.reply({
            content:
                `\`[ ✘ \`] Nie udało się zedytować wiadomości — sprawdź ID i kanał.`,
            flags: MessageFlags.Ephemeral,
        });
    }
}

async function handleDelete(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (!interaction.inGuild()) {
        return;
    }

    const messageId = interaction.options.getString(
        "id_wiadomosci",
        true,
    );

    const selectedChannel = interaction.options.getChannel(
        "kanal",
        false,
        TEXT_CHANNEL_TYPES,
    );

    const channel = selectedChannel ?? interaction.channel;

    if (!channel || !channel.isTextBased()) {
        await interaction.reply({
            content:
                `\`[ ✘ \`] Nie można usunąć wiadomości na tym kanale.`,
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    try {
        const targetMessage = await channel.messages.fetch(
            messageId,
        );

        await targetMessage.delete();

        await interaction.reply({
            content: `\`[ ✔ \`] Usunięto wiadomość \`${messageId}\`.`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error(
            "Błąd podczas usuwania wiadomości (/behavior delete):",
            error,
        );

        await interaction.reply({
            content:
                `\`[ ✘ \`] Nie udało się usunąć wiadomości — sprawdź ID, kanał i uprawnienia bota (Zarządzanie wiadomościami).`,
            flags: MessageFlags.Ephemeral,
        });
    }
}

async function handleWebhookSay(
    interaction: ChatInputCommandInteraction,
    botUser: User | null,
): Promise<void> {
    const channel = interaction.options.getChannel(
        "kanal",
        true,
        TEXT_CHANNEL_TYPES,
    );

    const displayName = interaction.options.getString(
        "nazwa",
        true,
    );

    const content = interaction.options.getString(
        "wiadomosc",
        true,
    );

    const avatarUrl =
        interaction.options.getString(
            "avatar_url",
            false,
        ) ?? undefined;

    if (!botUser) {
        await interaction.reply({
            content: `\`[ ✘ \`] Bot nie jest jeszcze gotowy, spróbuj ponownie za chwilę.`,
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    try {
        const webhook = await BehaviorWebhookService.getOrCreate(
            channel,
            botUser,
        );

        await webhook.send({
            content,
            username: displayName,
            avatarURL: avatarUrl,
        });

        logger.warn(
            `${interaction.user.tag} użył /behavior webhook-say jako "${displayName}" na #${channel.name} (${interaction.guildId})`,
        );

        await interaction.reply({
            content: `\`[ ✔ \`] Wysłano wiadomość na <#${channel.id}> jako "${displayName}".`,
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        logger.error(
            "Błąd podczas wysyłania wiadomości przez webhook (/behavior webhook-say):",
            error,
        );

        await interaction.reply({
            content: `\`[ ✘ \`] Nie udało się wysłać wiadomości — sprawdź uprawnienia bota (Zarządzaj webhookami) na tym kanale.`,
            flags: MessageFlags.Ephemeral,
        });
    }
}

async function handleTyping(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    if (!interaction.inGuild()) {
        return;
    }

    const seconds = interaction.options.getInteger(
        "sekundy",
        true,
    );

    const selectedChannel = interaction.options.getChannel(
        "kanal",
        false,
        TEXT_CHANNEL_TYPES,
    );

    const channel = selectedChannel ?? interaction.channel;

    if (!channel || !channel.isTextBased()) {
        await interaction.reply({
            content:
                `\`[ ✘ \`] Nie można wyświetlić wskaźnika pisania na tym kanale.`,
            flags: MessageFlags.Ephemeral,
        });

        return;
    }

    await interaction.reply({
        content: `\`[ ✔ \`] Bot będzie "pisał..." na <#${channel.id}> przez ${seconds}s.`,
        flags: MessageFlags.Ephemeral,
    });

    const endsAt = Date.now() + seconds * 1_000;

    const tick = async (): Promise<void> => {
        if (Date.now() >= endsAt) {
            return;
        }

        try {
            await channel.sendTyping();
        } catch (error) {
            logger.error(
                "Błąd podczas odświeżania wskaźnika pisania (/behavior typing):",
                error,
            );

            return;
        }

        setTimeout(() => void tick(), TYPING_REFRESH_MS);
    };

    await tick();
}