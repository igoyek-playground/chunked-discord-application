import {
    AttachmentBuilder,
    EmbedBuilder,
    type Guild,
    type Message,
} from "discord.js";

import { ticketsConfig } from "../../../config/modules/tickets.config.js";
import { logger } from "../../core/utils/logger.js";
import type { TicketChannel } from "./ticket-channel.service.js";
import type { TicketRecord } from "./ticket.repository.js";
import type { TicketCategoryConfig } from "./tickets.types.js";

const FETCH_BATCH_SIZE = 100;

export class TicketTranscriptService {
    /**
     * Pobiera całą historię wiadomości kanału/wątku (od najstarszej do
     * najnowszej) i generuje z niej prosty transkrypt tekstowy.
     */
    public static async generate(channel: TicketChannel): Promise<Buffer> {
        const chronological: Message[] = [];
        let beforeId: string | undefined;

        for (;;) {
            const batch = await channel.messages.fetch({
                limit: FETCH_BATCH_SIZE,
                ...(beforeId ? { before: beforeId } : {}),
            });

            if (batch.size === 0) {
                break;
            }

            chronological.push(...batch.values());

            beforeId = batch.last()?.id;

            if (batch.size < FETCH_BATCH_SIZE) {
                break;
            }
        }

        // Discord zwraca wiadomości od najnowszej do najstarszej w obrębie
        // każdej paczki, a kolejne paczki są coraz starsze - całość odwracamy
        // raz na końcu, żeby uzyskać porządek chronologiczny.
        chronological.reverse();

        const lines = chronological.map((message) => this.formatLine(message));

        const content =
            lines.length > 0
                ? lines.join("\n")
                : "(Kanał/wątek nie zawierał żadnych wiadomości.)";

        return Buffer.from(content, "utf-8");
    }

    public static async sendToLogs(
        guild: Guild,
        ticket: TicketRecord,
        category: TicketCategoryConfig | undefined,
        channelName: string,
        closedById: string,
        transcript: Buffer,
    ): Promise<void> {
        const logChannelId = ticketsConfig.logs.transcriptChannelId;
        const logChannel = guild.channels.cache.get(logChannelId);

        if (!logChannel || !logChannel.isTextBased()) {
            logger.warn(
                `Kanał logów ticketów (${logChannelId}) nie istnieje lub nie jest kanałem tekstowym.`,
            );

            return;
        }

        const embed = new EmbedBuilder()
            .setColor(ticketsConfig.ticketMessage.embedColor)
            .setTitle(
                ticketsConfig.messages.transcriptLogTitle
                    .replace("{CHANNEL}", channelName)
                    .replace("{OWNER}", `<@${ticket.ownerId}>`)
                    .replace(
                        "{CATEGORY}",
                        category?.select.label ?? ticket.categoryKey,
                    )
                    .replace(
                        "{CLAIMED_BY}",
                        ticket.claimedById ? `<@${ticket.claimedById}>` : "-",
                    ),
            )
            .addFields(
                { name: "Zainteresowany", value: `<@${ticket.ownerId}>`, inline: true },
                {
                    name: "Kategoria",
                    value: category?.select.label ?? ticket.categoryKey,
                    inline: true,
                },
                {
                    name: "Przejęty przez",
                    value: ticket.claimedById ? `<@${ticket.claimedById}>` : "-",
                    inline: true,
                },
                { name: "Zamknięty przez", value: `<@${closedById}>`, inline: true },
                {
                    name: "Otwarty",
                    value: `<t:${Math.floor(ticket.createdAt.getTime() / 1000)}:F>`,
                    inline: true,
                },
            )
            .setTimestamp();

        const attachment = new AttachmentBuilder(transcript, {
            name: `transkrypt-${channelName}.txt`,
        });

        try {
            await logChannel.send({
                embeds: [embed],
                files: [attachment],
            });
        } catch (error) {
            logger.error(
                "Nie udało się wysłać transkryptu ticketa na kanał logów:",
                error,
            );
        }
    }

    private static formatLine(message: Message): string {
        const timestamp = message.createdAt.toISOString();
        const author = `${message.author.tag} (${message.author.id})`;
        const content = message.content || "*(brak treści / załącznik lub embed)*";

        const attachments = [...message.attachments.values()]
            .map((attachment) => attachment.url)
            .join(", ");

        return attachments
            ? `[${timestamp}] ${author}: ${content}\n    Załączniki: ${attachments}`
            : `[${timestamp}] ${author}: ${content}`;
    }
}
