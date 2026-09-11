import {
    MessageFlags,
    type ButtonInteraction,
    type GuildTextBasedChannel,
    type InteractionReplyOptions,
    type ModalSubmitInteraction,
    type StringSelectMenuInteraction,
    type UserSelectMenuInteraction,
    type GuildMember,
} from "discord.js";

import { ticketsConfig } from "../../../config/modules/tickets.config.js";
import { logger } from "../../core/utils/logger.js";
import { TicketAccessService } from "./ticket-access.service.js";
import type { TicketChannel } from "./ticket-channel.service.js";
import { TicketChannelService } from "./ticket-channel.service.js";
import { TicketClaimService } from "./ticket-claim.service.js";
import { TicketLimitService } from "./ticket-limit.service.js";
import { TicketRepository } from "./ticket.repository.js";
import { TicketTranscriptService } from "./ticket-transcript.service.js";
import { TicketsEmbedBuilder } from "./tickets-embed.builder.js";
import { TicketsModalBuilder } from "./tickets-modal.builder.js";
import { TicketsPanelBuilder } from "./tickets-panel.builder.js";
import { TicketsSettingsBuilder } from "./tickets-settings.builder.js";
import { TICKET_CUSTOM_IDS, parseModalCustomId } from "./tickets.constants.js";
import type { TicketAnswer, TicketCategoryConfig } from "./tickets.types.js";

export class TicketsController {
    // =====================================================================
    // PANEL
    // =====================================================================

    public static async sendPanel(
        channel: GuildTextBasedChannel,
    ): Promise<void> {
        await channel.send(TicketsPanelBuilder.build());
    }

    // =====================================================================
    // WYBÓR KATEGORII -> MODAL
    // =====================================================================

    public static async handleCategorySelect(
        interaction: StringSelectMenuInteraction,
    ): Promise<void> {
        if (!(await this.guardEnabled(interaction))) {
            return;
        }

        if (!interaction.inGuild() || !interaction.guild) {
            return;
        }

        const categoryKey = interaction.values[0];
        const category = categoryKey ? this.findCategory(categoryKey) : undefined;

        if (!category) {
            await this.reply(interaction, ticketsConfig.messages.invalidCategory);

            return;
        }

        const reachedLimit = await TicketLimitService.hasReachedLimit(
            interaction.guild.id,
            interaction.user.id,
            category.key,
        );

        if (reachedLimit) {
            await this.reply(interaction, this.formatLimitMessage());

            return;
        }

        await interaction.showModal(TicketsModalBuilder.build(category));
    }

    // =====================================================================
    // SUBMIT MODALA -> UTWORZENIE TICKETA
    // =====================================================================

    public static async handleModalSubmit(
        interaction: ModalSubmitInteraction,
    ): Promise<void> {
        const categoryKey = parseModalCustomId(interaction.customId);

        if (categoryKey === null) {
            return;
        }

        if (!(await this.guardEnabled(interaction))) {
            return;
        }

        if (!interaction.inGuild() || !interaction.guild) {
            return;
        }

        const category = this.findCategory(categoryKey);

        if (!category) {
            await this.reply(interaction, ticketsConfig.messages.invalidCategory);

            return;
        }

        const reachedLimit = await TicketLimitService.hasReachedLimit(
            interaction.guild.id,
            interaction.user.id,
            category.key,
        );

        if (reachedLimit) {
            await this.reply(interaction, this.formatLimitMessage());

            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const answers = this.collectAnswers(interaction, category);

            const ownerMember =
                interaction.guild.members.cache.get(interaction.user.id) ??
                (await interaction.guild.members.fetch(interaction.user.id));

            const channel = await TicketChannelService.create(
                interaction.guild,
                category,
                ownerMember,
            );

            await TicketRepository.create(
                interaction.guild.id,
                channel.id,
                category.key,
                interaction.user.id,
            );

            await this.sendOpeningMessages(
                channel,
                category,
                ownerMember,
                answers,
            );

            await interaction.editReply({
                content: `Ticket został utworzony: ${channel}`,
            });
        } catch (error) {
            logger.error("Błąd podczas tworzenia ticketa:", error);

            await interaction.editReply({
                content: this.resolveCreateErrorMessage(error),
            });
        }
    }

    private static resolveCreateErrorMessage(error: unknown): string {
        if (
            error instanceof Error &&
            (error.message === "TICKET_CATEGORY_PARENT_NOT_CONFIGURED" ||
                error.message === "TICKET_THREAD_PARENT_NOT_CONFIGURED" ||
                error.message === "TICKET_THREAD_PARENT_NOT_FOUND")
        ) {
            return ticketsConfig.messages.categoryMisconfigured;
        }

        return ticketsConfig.messages.internalError;
    }

    // =====================================================================
    // ZAMYKANIE TICKETA
    // =====================================================================

    public static async handleCloseButtonClick(
        interaction: ButtonInteraction,
    ): Promise<void> {
        if (!(await this.guardEnabled(interaction))) {
            return;
        }

        await interaction.reply({
            content: ticketsConfig.messages.closeConfirmPrompt,
            components: [TicketsEmbedBuilder.buildCloseConfirmRow()],
            flags: MessageFlags.Ephemeral,
        });
    }

    public static async handleCloseCancel(
        interaction: ButtonInteraction,
    ): Promise<void> {
        await interaction.update({
            content: ticketsConfig.messages.closeCancelled,
            components: [],
        });
    }

    public static async handleCloseConfirm(
        interaction: ButtonInteraction,
    ): Promise<void> {
        if (!interaction.inGuild() || !interaction.guild || !interaction.channel) {
            return;
        }

        const channel = interaction.channel as TicketChannel;

        const ticket = await TicketRepository.findByChannelId(channel.id);

        if (!ticket) {
            await interaction.update({
                content: ticketsConfig.messages.internalError,
                components: [],
            });

            return;
        }

        await interaction.update({
            content: "`[ ✔ ]` Zamykanie ticketa i generowanie transkryptu...",
            components: [],
        });

        try {
            const category = this.findCategory(ticket.categoryKey);
            const channelName = channel.name ?? ticket.channelId;

            const transcript = await TicketTranscriptService.generate(channel);

            await TicketTranscriptService.sendToLogs(
                interaction.guild,
                ticket,
                category,
                channelName,
                interaction.user.id,
                transcript,
            );

            await TicketRepository.markClosed(channel.id, interaction.user.id);

            if (channel.isThread()) {
                await channel.edit({ archived: true, locked: true });
            } else {
                await channel.delete(
                    "`[ ✔ ]` Ticket zamknięty przez ${interaction.user.tag}",
                );
            }
        } catch (error) {
            logger.error("Błąd podczas zamykania ticketa:", error);

            await interaction
                .followUp({
                    content: ticketsConfig.messages.internalError,
                    flags: MessageFlags.Ephemeral,
                })
                .catch(() => {});
        }
    }

    // =====================================================================
    // PRZEJMOWANIE TICKETA
    // =====================================================================

    public static async handleClaimButtonClick(
        interaction: ButtonInteraction,
    ): Promise<void> {
        if (!(await this.guardEnabled(interaction))) {
            return;
        }

        if (!interaction.inGuild() || !interaction.guild || !interaction.channel) {
            return;
        }

        const channel = interaction.channel as TicketChannel;
        const ticket = await TicketRepository.findByChannelId(channel.id);

        if (!ticket) {
            await this.reply(interaction, ticketsConfig.messages.internalError);

            return;
        }

        if (ticket.claimedById) {
            await this.reply(
                interaction,
                ticketsConfig.messages.claimedAnnouncement.replace(
                    "{USER}",
                    `<@${ticket.claimedById}>`,
                ),
            );

            return;
        }

        const category = this.findCategory(ticket.categoryKey);

        if (!category) {
            await this.reply(interaction, ticketsConfig.messages.internalError);

            return;
        }

        const claimerMember =
            interaction.guild.members.cache.get(interaction.user.id) ??
            (await interaction.guild.members.fetch(interaction.user.id));

        const ownerMember =
            interaction.guild.members.cache.get(ticket.ownerId) ??
            (await interaction.guild.members
                .fetch(ticket.ownerId)
                .catch(() => null));

        if (!ownerMember) {
            await this.reply(
                interaction,
                "`[ ✘ ]` Nie udało się przejąć ticketa - zainteresowany opuścił serwer.",
            );

            return;
        }

        const result = await TicketClaimService.claim(
            channel,
            category,
            claimerMember,
            ownerMember,
        );

        await TicketRepository.markClaimed(channel.id, claimerMember.id);

        const announcement = ticketsConfig.messages.claimedAnnouncement.replace(
            "{USER}",
            `${claimerMember}`,
        );

        const content = result.fellBackToIsolate
            ? `${announcement}\n-# ${ticketsConfig.messages.claimReadOnlyThreadFallbackNotice}`
            : announcement;

        await interaction.reply({ content });
    }

    // =====================================================================
    // USTAWIENIA
    // =====================================================================

    public static async handleSettingsButtonClick(
        interaction: ButtonInteraction,
    ): Promise<void> {
        await interaction.reply({
            content: "Ustawienia ticketa:",
            components: [TicketsEmbedBuilder.buildSettingsRow()],
            flags: MessageFlags.Ephemeral,
        });
    }

    public static async handleSettingsAddUserButtonClick(
        interaction: ButtonInteraction,
    ): Promise<void> {
        await interaction.update({
            content: ticketsConfig.messages.settingsAddUserPrompt,
            components: [TicketsSettingsBuilder.buildAddUserSelectRow()],
        });
    }

    public static async handleSettingsAddUserSelect(
        interaction: UserSelectMenuInteraction,
    ): Promise<void> {
        if (!interaction.channel) {
            return;
        }

        const selectedUser = interaction.users.first();

        if (!selectedUser) {
            return;
        }

        const channel = interaction.channel as TicketChannel;

        try {
            await TicketAccessService.addUser(channel, selectedUser.id);

            await interaction.update({
                content: ticketsConfig.messages.settingsUserAdded.replace(
                    "{USER}",
                    `${selectedUser}`,
                ),
                components: [],
            });
        } catch (error) {
            logger.error(
                "Błąd podczas dodawania użytkownika do ticketa:",
                error,
            );

            await interaction.update({
                content: ticketsConfig.messages.internalError,
                components: [],
            });
        }
    }

    public static async handleSettingsNotifyOwner(
        interaction: ButtonInteraction,
    ): Promise<void> {
        if (!interaction.channel) {
            return;
        }

        const channel = interaction.channel as TicketChannel;
        const ticket = await TicketRepository.findByChannelId(channel.id);

        if (!ticket) {
            await this.reply(interaction, ticketsConfig.messages.internalError);

            return;
        }

        try {
            const owner = await interaction.client.users.fetch(ticket.ownerId);

            await owner.send(
                ticketsConfig.messages.ownerNotifyDmContent.replace(
                    "{CHANNEL}",
                    channel.name ?? "ticket",
                ),
            );

            await this.reply(interaction, ticketsConfig.messages.settingsNotifySent);
        } catch (error) {
            logger.debug(
                `Nie udało się wysłać powiadomienia PV do zainteresowanego: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );

            await this.reply(
                interaction,
                ticketsConfig.messages.settingsNotifyDmFailed,
            );
        }
    }

    public static async handleSettingsSendDmButtonClick(
        interaction: ButtonInteraction,
    ): Promise<void> {
        await interaction.showModal(TicketsSettingsBuilder.buildSendDmModal());
    }

    public static async handleSettingsSendDmModalSubmit(
        interaction: ModalSubmitInteraction,
    ): Promise<void> {
        if (!interaction.channel) {
            return;
        }

        const channel = interaction.channel as TicketChannel;
        const ticket = await TicketRepository.findByChannelId(channel.id);

        if (!ticket) {
            await this.reply(interaction, ticketsConfig.messages.internalError);

            return;
        }

        const message = interaction.fields.getTextInputValue(
            TICKET_CUSTOM_IDS.settingsSendDmInput,
        );

        try {
            const owner = await interaction.client.users.fetch(ticket.ownerId);

            await owner.send(message);

            await this.reply(interaction, ticketsConfig.messages.settingsDmSent);
        } catch (error) {
            logger.debug(
                `Nie udało się wysłać wiadomości PV do zainteresowanego: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );

            await this.reply(interaction, ticketsConfig.messages.settingsDmFailed);
        }
    }

    // =====================================================================
    // POMOCNICZE
    // =====================================================================

    private static findCategory(
        key: string,
    ): TicketCategoryConfig | undefined {
        return ticketsConfig.categories.find((category) => category.key === key);
    }

    private static collectAnswers(
        interaction: ModalSubmitInteraction,
        category: TicketCategoryConfig,
    ): TicketAnswer[] {
        return category.questions.map((question) => ({
            questionId: question.id,
            label: question.label,
            value: interaction.fields.getTextInputValue(question.id),
        }));
    }

    private static async sendOpeningMessages(
        channel: TicketChannel,
        category: TicketCategoryConfig,
        owner: GuildMember,
        answers: TicketAnswer[],
    ): Promise<void> {
        const pingContent = TicketsEmbedBuilder.buildPingContent(category, owner);

        if (pingContent) {
            const pingMessage = await channel.send({
                content: pingContent,
                allowedMentions: {
                    parse: ["users", "roles"],
                },
            });

            const deleteAfterMs =
                ticketsConfig.ticketMessage.pingMessageDeleteAfterSeconds * 1000;

            setTimeout(() => {
                pingMessage.delete().catch(() => {});
            }, deleteAfterMs);
        }

        await channel.send(
            TicketsEmbedBuilder.buildTicketMessage(category, owner, answers),
        );
    }

    private static formatLimitMessage(): string {
        return ticketsConfig.messages.limitReached.replace(
            "{LIMIT}",
            String(ticketsConfig.limits.maxOpenTicketsPerUser),
        );
    }

    private static async guardEnabled(
        interaction:
            | ButtonInteraction
            | ModalSubmitInteraction
            | StringSelectMenuInteraction,
    ): Promise<boolean> {
        if (ticketsConfig.enabled) {
            return true;
        }

        await this.reply(interaction, ticketsConfig.messages.disabled);

        return false;
    }

    private static async reply(
        interaction:
            | ButtonInteraction
            | ModalSubmitInteraction
            | StringSelectMenuInteraction
            | UserSelectMenuInteraction,
        content: string,
    ): Promise<void> {
        const payload: InteractionReplyOptions = {
            content,
            flags: MessageFlags.Ephemeral,
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(payload);
        } else {
            await interaction.reply(payload);
        }
    }
}
