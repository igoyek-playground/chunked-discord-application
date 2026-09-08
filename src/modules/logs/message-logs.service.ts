import {
    AuditLogEvent,
    type GuildTextBasedChannel,
    type Message,
    type PartialMessage,
    type ReadonlyCollection,
    type Snowflake,
} from "discord.js";

import { logsConfig } from "../../../config/modules/logs.config.js";
import { LOG_COLORS, LogsEmbedBuilder } from "./logs-embed.builder.js";
import { LogsService } from "./logs.service.js";

export class MessageLogsService {
    public static async logDelete(
        message: Message | PartialMessage,
    ): Promise<void> {
        if (!message.guild || message.author?.bot) {
            return;
        }

        const executor = message.author
            ? (
                await LogsService.findAuditEntry(
                    message.guild,
                    AuditLogEvent.MessageDelete,
                    message.author.id,
                )
            )?.executor
            : null;

        const embed = LogsEmbedBuilder.base(
            "🗑️ Usunięto wiadomość",
            LOG_COLORS.danger,
        ).addFields([
            {
                name: "Autor",
                value: message.author
                    ? LogsEmbedBuilder.formatUser(message.author)
                    : "Nieznany (wiadomość nie była w cache)",
                inline: true,
            },
            {
                name: "Kanał",
                value: `${message.channel}`,
                inline: true,
            },
            {
                name: "Usunięte przez",
                value: executor
                    ? LogsEmbedBuilder.formatUser(executor)
                    : "Autora wiadomości",
                inline: true,
            },
            {
                name: "Treść",
                value: message.content
                    ? LogsEmbedBuilder.truncate(message.content)
                    : "*Brak zapisanej treści (wiadomość nie była w cache)*",
            },
        ]);

        if (message.author) {
            LogsEmbedBuilder.withUserFooter(embed, message.author);
        }

        await LogsService.send(
            message.guild,
            logsConfig.messages.delete,
            embed,
            "usunięcie wiadomości",
        );
    }

    public static async logBulkDelete(
        messages: ReadonlyCollection<Snowflake, Message<true> | PartialMessage<true>>,
        channel: GuildTextBasedChannel,
    ): Promise<void> {
        if (messages.size === 0) {
            return;
        }

        const guild = channel.guild;

        const executor = (
            await LogsService.findAuditEntry(
                guild,
                AuditLogEvent.MessageBulkDelete,
                channel.id,
            )
        )?.executor;

        const embed = LogsEmbedBuilder.base(
            "🧹 Usunięto wiele wiadomości",
            LOG_COLORS.danger,
        ).addFields([
            {
                name: "Liczba wiadomości",
                value: `${messages.size}`,
                inline: true,
            },
            {
                name: "Kanał",
                value: `${channel}`,
                inline: true,
            },
            {
                name: "Usunięte przez",
                value: LogsEmbedBuilder.formatModerator(executor),
                inline: true,
            },
        ]);

        await LogsService.send(
            guild,
            logsConfig.messages.bulkDelete,
            embed,
            "masowe usunięcie wiadomości",
        );
    }

    public static async logEdit(
        oldMessage: Message | PartialMessage,
        newMessage: Message,
    ): Promise<void> {
        if (
            !newMessage.guild ||
            newMessage.author.bot ||
            oldMessage.content === newMessage.content
        ) {
            return;
        }

        const embed = LogsEmbedBuilder.base(
            "✏️ Edytowano wiadomość",
            LOG_COLORS.warning,
        )
            .setURL(newMessage.url)
            .addFields([
                {
                    name: "Autor",
                    value: LogsEmbedBuilder.formatUser(newMessage.author),
                    inline: true,
                },
                {
                    name: "Kanał",
                    value: `${newMessage.channel}`,
                    inline: true,
                },
                {
                    name: "Przed",
                    value: oldMessage.content
                        ? LogsEmbedBuilder.truncate(oldMessage.content)
                        : "*Brak zapisanej treści (wiadomość nie była w cache)*",
                },
                {
                    name: "Po",
                    value: LogsEmbedBuilder.truncate(newMessage.content),
                },
            ]);

        LogsEmbedBuilder.withUserFooter(embed, newMessage.author);

        await LogsService.send(
            newMessage.guild,
            logsConfig.messages.edit,
            embed,
            "edycja wiadomości",
        );
    }
}
