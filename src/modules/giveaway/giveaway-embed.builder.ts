import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    resolveColor,
} from "discord.js";

import type { Giveaway } from "../../../generated/prisma/client.js";

import { giveawayConfig } from "../../../config/modules/giveaway.config.js";
import { GIVEAWAY_CUSTOM_IDS } from "./giveaway.constants.js";
import { GIVEAWAY_STATUS } from "./giveaway.types.js";

export class GiveawayEmbedBuilder {
    public static buildActive(
        giveaway: Giveaway,
        entryCount: number,
    ): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    } {
        const endsAtSeconds = Math.floor(
            giveaway.endsAt.getTime() / 1000,
        );

        const description = giveawayConfig.embed.activeDescription
            .replaceAll("{PRIZE}", giveaway.prize)
            .replaceAll(
                "{WINNER_COUNT}",
                String(giveaway.winnerCount),
            )
            .replaceAll("{HOST}", `<@${giveaway.hostId}>`)
            .replaceAll(
                "{ENDS_RELATIVE}",
                `<t:${endsAtSeconds}:R>`,
            )
            .replaceAll(
                "{ENDS_FULL}",
                `<t:${endsAtSeconds}:f>`,
            );

        const embed = new EmbedBuilder()
            .setColor(
                resolveColor(giveawayConfig.embed.activeColor),
            )
            .setTitle(giveawayConfig.embed.title)
            .setDescription(description)
            .setFooter({
                text: giveawayConfig.embed.footer.replaceAll(
                    "{ID}",
                    giveaway.id,
                ),
            })
            .setTimestamp(giveaway.endsAt);

        const button = new ButtonBuilder()
            .setCustomId(
                `${GIVEAWAY_CUSTOM_IDS.join}:${giveaway.id}`,
            )
            .setLabel(
                giveawayConfig.button.joinLabel.replaceAll(
                    "{COUNT}",
                    String(entryCount),
                ),
            )
            .setStyle(ButtonStyle.Success)
            .setEmoji("🎉");

        return {
            embed,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    button,
                ),
            ],
        };
    }

    public static buildEnded(
        giveaway: Giveaway,
        winnerUserIds: string[],
    ): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    } {
        const winnersText =
            winnerUserIds.length > 0
                ? winnerUserIds
                      .map((userId) => `<@${userId}>`)
                      .join(", ")
                : giveawayConfig.embed.noWinnersText;

        const description = giveawayConfig.embed.endedDescription
            .replaceAll("{PRIZE}", giveaway.prize)
            .replaceAll("{WINNERS}", winnersText)
            .replaceAll("{HOST}", `<@${giveaway.hostId}>`);

        const embed = new EmbedBuilder()
            .setColor(
                resolveColor(giveawayConfig.embed.endedColor),
            )
            .setTitle(giveawayConfig.embed.title)
            .setDescription(description)
            .setFooter({
                text: giveawayConfig.embed.footer.replaceAll(
                    "{ID}",
                    giveaway.id,
                ),
            })
            .setTimestamp(
                giveaway.endedAt ?? new Date(),
            );

        const button = new ButtonBuilder()
            .setCustomId(
                `${GIVEAWAY_CUSTOM_IDS.join}:${giveaway.id}:disabled`,
            )
            .setLabel(giveawayConfig.button.endedLabel)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        return {
            embed,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    button,
                ),
            ],
        };
    }

    public static buildCancelled(
        giveaway: Giveaway,
    ): {
        embed: EmbedBuilder;
        components: ActionRowBuilder<ButtonBuilder>[];
    } {
        const description =
            giveawayConfig.embed.cancelledDescription.replaceAll(
                "{PRIZE}",
                giveaway.prize,
            );

        const embed = new EmbedBuilder()
            .setColor(
                resolveColor(
                    giveawayConfig.embed.cancelledColor,
                ),
            )
            .setTitle(giveawayConfig.embed.title)
            .setDescription(description)
            .setFooter({
                text: giveawayConfig.embed.footer.replaceAll(
                    "{ID}",
                    giveaway.id,
                ),
            });

        const button = new ButtonBuilder()
            .setCustomId(
                `${GIVEAWAY_CUSTOM_IDS.join}:${giveaway.id}:disabled`,
            )
            .setLabel(giveawayConfig.button.cancelledLabel)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        return {
            embed,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    button,
                ),
            ],
        };
    }

    /**
     * Wiadomość efemeryczna wyświetlana po ponownym kliknięciu
     * przycisku dołączenia — informuje, że użytkownik już bierze
     * udział, i daje przycisk do rezygnacji.
     */
    public static buildAlreadyJoinedReply(
        giveawayId: string,
    ): {
        content: string;
        components: ActionRowBuilder<ButtonBuilder>[];
    } {
        const button = new ButtonBuilder()
            .setCustomId(
                `${GIVEAWAY_CUSTOM_IDS.leave}:${giveawayId}`,
            )
            .setLabel(giveawayConfig.button.leaveLabel)
            .setStyle(ButtonStyle.Danger);

        return {
            content: giveawayConfig.messages.alreadyJoined,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    button,
                ),
            ],
        };
    }

    public static forStatus(
        giveaway: Giveaway,
        entryCount: number,
        winnerUserIds: string[],
    ) {
        if (giveaway.status === GIVEAWAY_STATUS.ended) {
            return this.buildEnded(giveaway, winnerUserIds);
        }

        if (giveaway.status === GIVEAWAY_STATUS.cancelled) {
            return this.buildCancelled(giveaway);
        }

        return this.buildActive(giveaway, entryCount);
    }
}