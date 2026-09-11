import {
    MessageFlags,
    type ButtonInteraction,
    type Guild,
    type GuildTextBasedChannel,
} from "discord.js";

import type { Bot } from "../../core/bot.js";
import type { Giveaway } from "../../../generated/prisma/client.js";

import { giveawayConfig } from "../../../config/modules/giveaway.config.js";
import { logger } from "../../core/utils/logger.js";
import { GiveawayEmbedBuilder } from "./giveaway-embed.builder.js";
import { GiveawayScheduler } from "./giveaway-scheduler.service.js";
import { GiveawayService } from "./giveaway.service.js";
import { GIVEAWAY_STATUS } from "./giveaway.types.js";
import type { CreateGiveawayInput } from "./giveaway.types.js";

export type GiveawayCommandError =
    | "not-found"
    | "not-active"
    | "not-ended";

export class GiveawayController {
    public static initialize(bot: Bot): void {
        GiveawayScheduler.initialize(bot, (giveawayId) =>
            this.resolve(bot, giveawayId),
        );
    }

    // ---------------------------------------------------------------
    // /giveaway start
    // ---------------------------------------------------------------

    public static async start(
        channel: GuildTextBasedChannel,
        input: CreateGiveawayInput,
    ): Promise<Giveaway> {
        const giveaway = await GiveawayService.create(input);

        const { embed, components } =
            GiveawayEmbedBuilder.buildActive(giveaway, 0);

        const message = await channel.send({
            embeds: [embed],
            components,
        });

        await GiveawayService.setMessageId(
            giveaway.id,
            message.id,
        );

        GiveawayScheduler.schedule(giveaway);

        return giveaway;
    }

    // ---------------------------------------------------------------
    // join / resign button
    // ---------------------------------------------------------------

    public static async handleJoinButtonClick(
        interaction: ButtonInteraction,
        giveawayId: string,
        bot: Bot,
    ): Promise<void> {
        const giveaway =
            await GiveawayService.findById(giveawayId);

        if (
            !giveaway ||
            giveaway.status !== GIVEAWAY_STATUS.active
        ) {
            await interaction.reply({
                content:
                    giveawayConfig.messages.giveawayEnded,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        const alreadyJoined = await GiveawayService.hasEntry(
            giveawayId,
            interaction.user.id,
        );

        if (alreadyJoined) {
            const reply =
                GiveawayEmbedBuilder.buildAlreadyJoinedReply(
                    giveawayId,
                );

            await interaction.reply({
                content: reply.content,
                components: reply.components,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        await GiveawayService.addEntry(
            giveawayId,
            interaction.user.id,
        );

        await this.refreshActiveMessage(bot, giveaway);

        await interaction.reply({
            content: giveawayConfig.messages.joined,
            flags: MessageFlags.Ephemeral,
        });
    }

    public static async handleLeaveButtonClick(
        interaction: ButtonInteraction,
        giveawayId: string,
        bot: Bot,
    ): Promise<void> {
        const giveaway =
            await GiveawayService.findById(giveawayId);

        if (
            !giveaway ||
            giveaway.status !== GIVEAWAY_STATUS.active
        ) {
            await interaction.reply({
                content:
                    giveawayConfig.messages.giveawayEnded,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        const result = await GiveawayService.removeEntry(
            giveawayId,
            interaction.user.id,
        );

        if (result === "not-joined") {
            await interaction.reply({
                content: giveawayConfig.messages.notJoined,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        await this.refreshActiveMessage(bot, giveaway);

        await interaction.update({
            content: giveawayConfig.messages.left,
            components: [],
        });
    }

    // ---------------------------------------------------------------
    // /giveaway force-stop, cancel, reroll, set-time, set-winners
    // ---------------------------------------------------------------

    public static async forceStop(
        bot: Bot,
        giveawayId: string,
    ): Promise<GiveawayCommandError | null> {
        const giveaway =
            await GiveawayService.findById(giveawayId);

        if (!giveaway) {
            return "not-found";
        }

        if (giveaway.status !== GIVEAWAY_STATUS.active) {
            return "not-active";
        }

        GiveawayScheduler.clear(giveawayId);

        await this.resolve(bot, giveawayId);

        return null;
    }

    public static async cancel(
        bot: Bot,
        giveawayId: string,
    ): Promise<GiveawayCommandError | null> {
        const giveaway =
            await GiveawayService.findById(giveawayId);

        if (!giveaway) {
            return "not-found";
        }

        if (giveaway.status !== GIVEAWAY_STATUS.active) {
            return "not-active";
        }

        GiveawayScheduler.clear(giveawayId);

        await GiveawayService.markCancelled(giveawayId);

        const updated = await GiveawayService.findById(
            giveawayId,
        );

        if (updated) {
            await this.editOriginalMessage(
                bot,
                updated,
                GiveawayEmbedBuilder.buildCancelled(updated),
            );
        }

        return null;
    }

    public static async setTime(
        giveawayId: string,
        endsAt: Date,
    ): Promise<GiveawayCommandError | null> {
        const giveaway =
            await GiveawayService.findById(giveawayId);

        if (!giveaway) {
            return "not-found";
        }

        if (giveaway.status !== GIVEAWAY_STATUS.active) {
            return "not-active";
        }

        await GiveawayService.setEndsAt(giveawayId, endsAt);

        const updated = await GiveawayService.findById(
            giveawayId,
        );

        if (updated) {
            GiveawayScheduler.schedule(updated);
        }

        return null;
    }

    public static async setWinnerCount(
        giveawayId: string,
        winnerCount: number,
    ): Promise<GiveawayCommandError | null> {
        const giveaway =
            await GiveawayService.findById(giveawayId);

        if (!giveaway) {
            return "not-found";
        }

        if (giveaway.status !== GIVEAWAY_STATUS.active) {
            return "not-active";
        }

        await GiveawayService.setWinnerCount(
            giveawayId,
            winnerCount,
        );

        return null;
    }

    public static async reroll(
        bot: Bot,
        giveawayId: string,
        additionalWinnerCount: number,
    ): Promise<
        | { error: GiveawayCommandError }
        | { error: null; newWinnerIds: string[] }
    > {
        const giveaway =
            await GiveawayService.findById(giveawayId);

        if (!giveaway) {
            return { error: "not-found" };
        }

        if (giveaway.status !== GIVEAWAY_STATUS.ended) {
            return { error: "not-ended" };
        }

        const [entryUserIds, currentWinnerIds] =
            await Promise.all([
                GiveawayService.listEntryUserIds(giveawayId),
                GiveawayService.listWinnerUserIds(giveawayId),
            ]);

        const newWinnerIds = GiveawayService.pickRandomWinners(
            entryUserIds,
            currentWinnerIds,
            additionalWinnerCount,
        );

        if (newWinnerIds.length === 0) {
            return { error: null, newWinnerIds: [] };
        }

        await GiveawayService.addWinners(
            giveawayId,
            newWinnerIds,
            true,
        );

        const allWinnerIds = [
            ...currentWinnerIds,
            ...newWinnerIds,
        ];

        await this.editOriginalMessage(
            bot,
            giveaway,
            GiveawayEmbedBuilder.buildEnded(
                giveaway,
                allWinnerIds,
            ),
        );

        await this.announce(
            bot,
            giveaway,
            giveawayConfig.messages.announceReroll,
            newWinnerIds,
        );

        return { error: null, newWinnerIds };
    }

    // ---------------------------------------------------------------
    // giveaway resolution
    // ---------------------------------------------------------------

    private static async resolve(
        bot: Bot,
        giveawayId: string,
    ): Promise<void> {
        const giveaway =
            await GiveawayService.findById(giveawayId);

        if (
            !giveaway ||
            giveaway.status !== GIVEAWAY_STATUS.active
        ) {
            return;
        }

        const entryUserIds =
            await GiveawayService.listEntryUserIds(giveawayId);

        const winnerIds = GiveawayService.pickRandomWinners(
            entryUserIds,
            [],
            giveaway.winnerCount,
        );

        await GiveawayService.addWinners(
            giveawayId,
            winnerIds,
            false,
        );

        await GiveawayService.markEnded(giveawayId);

        const updated = await GiveawayService.findById(
            giveawayId,
        );

        if (!updated) {
            return;
        }

        await this.editOriginalMessage(
            bot,
            updated,
            GiveawayEmbedBuilder.buildEnded(
                updated,
                winnerIds,
            ),
        );

        if (winnerIds.length > 0) {
            await this.announce(
                bot,
                updated,
                giveawayConfig.messages.announceWinners,
                winnerIds,
            );
        } else {
            await this.announceNoWinners(bot, updated);
        }
    }

    // ---------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------

    private static async refreshActiveMessage(
        bot: Bot,
        giveaway: Giveaway,
    ): Promise<void> {
        const entryCount = await GiveawayService.countEntries(
            giveaway.id,
        );

        const { embed, components } =
            GiveawayEmbedBuilder.buildActive(
                giveaway,
                entryCount,
            );

        const channel = await this.resolveChannel(
            bot,
            giveaway,
        );

        if (!channel || !giveaway.messageId) {
            return;
        }

        try {
            const message = await channel.messages.fetch(
                giveaway.messageId,
            );

            await message.edit({
                embeds: [embed],
                components,
            });
        } catch (error) {
            logger.error(
                `Nie udało się zaktualizować wiadomości konkursu ${giveaway.id}:`,
                error,
            );
        }
    }

    private static async editOriginalMessage(
        bot: Bot,
        giveaway: Giveaway,
        payload: ReturnType<
            typeof GiveawayEmbedBuilder.buildEnded
        >,
    ): Promise<void> {
        const channel = await this.resolveChannel(
            bot,
            giveaway,
        );

        if (!channel || !giveaway.messageId) {
            return;
        }

        try {
            const message = await channel.messages.fetch(
                giveaway.messageId,
            );

            await message.edit({
                embeds: [payload.embed],
                components: payload.components,
            });
        } catch (error) {
            logger.error(
                `Nie udało się zaktualizować wiadomości konkursu ${giveaway.id}:`,
                error,
            );
        }
    }

    private static async announce(
        bot: Bot,
        giveaway: Giveaway,
        template: string,
        winnerUserIds: string[],
    ): Promise<void> {
        const channel = await this.resolveChannel(
            bot,
            giveaway,
        );

        if (!channel) {
            return;
        }

        const content = template
            .replaceAll("{PRIZE}", giveaway.prize)
            .replaceAll("{ID}", giveaway.id)
            .replaceAll(
                "{WINNERS}",
                winnerUserIds
                    .map((userId) => `<@${userId}>`)
                    .join(", "),
            );

        await channel.send({
            content,
            allowedMentions: {
                users: winnerUserIds,
            },
        });
    }

    private static async announceNoWinners(
        bot: Bot,
        giveaway: Giveaway,
    ): Promise<void> {
        const channel = await this.resolveChannel(
            bot,
            giveaway,
        );

        if (!channel) {
            return;
        }

        const content =
            giveawayConfig.messages.announceNoWinners
                .replaceAll("{PRIZE}", giveaway.prize)
                .replaceAll("{ID}", giveaway.id);

        await channel.send({ content });
    }

    private static async resolveChannel(
        bot: Bot,
        giveaway: Giveaway,
    ): Promise<GuildTextBasedChannel | null> {
        try {
            const guild: Guild =
                bot.guilds.cache.get(giveaway.guildId) ??
                (await bot.guilds.fetch(giveaway.guildId));

            const channel =
                guild.channels.cache.get(
                    giveaway.channelId,
                ) ??
                (await guild.channels.fetch(
                    giveaway.channelId,
                ));

            if (!channel || !channel.isTextBased()) {
                return null;
            }

            return channel as GuildTextBasedChannel;
        } catch (error) {
            logger.error(
                `Nie udało się pobrać kanału konkursu ${giveaway.id}:`,
                error,
            );

            return null;
        }
    }
}