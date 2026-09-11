import {
    MessageFlags,
    type ButtonInteraction,
    type Guild,
    type GuildMember,
    type GuildTextBasedChannel,
    type InteractionReplyOptions,
    type ModalSubmitInteraction,
} from "discord.js";

import { verificationConfig } from "../../../config/modules/verification.config.js";
import { logger } from "../../core/utils/logger.js";
import { VerificationAttemptService } from "./verification-attempt.service.js";
import { VerificationCodeService } from "./verification-code.service.js";
import { VerificationModalBuilder } from "./verification-modal.builder.js";
import { VerificationPanelBuilder } from "./verification-panel.builder.js";
import { VerificationRoleService } from "./verification-role.service.js";
import { VerificationService } from "./verification.service.js";
import { VerificationSessionService } from "./verification-session.service.js";
import { VERIFICATION_CUSTOM_IDS } from "./verification.constants.js";

export class VerificationController {
    public static async sendPanel(
        channel: GuildTextBasedChannel,
    ): Promise<void> {
        await channel.send(
            VerificationPanelBuilder.build(),
        );
    }

    public static async handleVerifyButtonClick(
        interaction: ButtonInteraction,
    ): Promise<void> {
        if (!verificationConfig.enabled) {
            await this.reply(
                interaction,
                verificationConfig.messages.disabled,
            );

            return;
        }

        if (
            !interaction.inGuild() ||
            !interaction.guild
        ) {
            return;
        }

        const lockedUntil =
            VerificationAttemptService.isLocked(
                interaction.guild.id,
                interaction.user.id,
            );

        if (lockedUntil) {
            await this.reply(
                interaction,
                this.formatLockedMessage(lockedUntil),
            );

            return;
        }

        const member =
            interaction.guild.members.cache.get(
                interaction.user.id,
            ) ??
            await interaction.guild.members.fetch(
                interaction.user.id,
            );

        if (
            member.roles.cache.has(
                verificationConfig.verifiedRoleId,
            )
        ) {
            await this.reply(
                interaction,
                verificationConfig.messages.alreadyVerified,
            );

            return;
        }

        const code =
            VerificationCodeService.generate(
                verificationConfig.code.length,
            );

        VerificationSessionService.create(
            interaction.guild.id,
            interaction.user.id,
            code,
            verificationConfig.code.expiresAfterSeconds,
        );

        await interaction.showModal(
            VerificationModalBuilder.build(code),
        );
    }

    public static async handleModalSubmit(
        interaction: ModalSubmitInteraction,
    ): Promise<void> {
        if (
            !interaction.inGuild() ||
            !interaction.guild
        ) {
            return;
        }

        const lockedUntil =
            VerificationAttemptService.isLocked(
                interaction.guild.id,
                interaction.user.id,
            );

        if (lockedUntil) {
            await this.reply(
                interaction,
                this.formatLockedMessage(lockedUntil),
            );

            return;
        }

        try {
            const input =
                interaction.fields.getTextInputValue(
                    VERIFICATION_CUSTOM_IDS.codeInput,
                );

            const result =
                VerificationService.validateCode(
                    interaction.guild.id,
                    interaction.user.id,
                    input,
                );

            if (result === "expired") {
                await this.reply(
                    interaction,
                    verificationConfig.messages.expiredCode,
                );

                return;
            }

            if (result === "invalid") {
                await this.handleInvalidCode(
                    interaction,
                );

                return;
            }

            await this.handleSuccessfulVerification(
                interaction,
            );
        } catch (error) {
            logger.error(
                "Błąd podczas weryfikacji użytkownika:",
                error,
            );

            await this.replyOrFollowUp(
                interaction,
                this.resolveGrantErrorMessage(error),
            );
        }
    }

    public static async forceVerify(
        guild: Guild,
        member: GuildMember,
    ): Promise<void> {
        await VerificationRoleService.grantVerifiedRole(
            guild,
            member,
        );

        VerificationSessionService.delete(
            guild.id,
            member.id,
        );

        VerificationAttemptService.reset(
            guild.id,
            member.id,
        );
    }

    public static removeLimit(
        guildId: string,
        userId: string,
    ): void {
        VerificationAttemptService.reset(
            guildId,
            userId,
        );
    }

    public static resolveGrantErrorMessage(
        error: unknown,
    ): string {
        if (
            error instanceof Error &&
            error.message ===
                "VERIFICATION_ROLE_NOT_FOUND"
        ) {
            return verificationConfig.messages.missingRole;
        }

        if (
            error instanceof Error &&
            (
                error.message ===
                    "ROLE_HIERARCHY_ERROR" ||
                error.message ===
                    "BOT_MISSING_MANAGE_ROLES"
            )
        ) {
            return verificationConfig.messages.roleHierarchyError;
        }

        return verificationConfig.messages.internalError;
    }

    private static async handleInvalidCode(
        interaction: ModalSubmitInteraction,
    ): Promise<void> {
        if (
            !interaction.guild
        ) {
            return;
        }

        const lockedUntil =
            VerificationAttemptService.registerFailure(
                interaction.guild.id,
                interaction.user.id,
            );

        if (lockedUntil) {
            await this.reply(
                interaction,
                this.formatLockedMessage(lockedUntil),
            );

            return;
        }

        await this.reply(
            interaction,
            verificationConfig.messages.invalidCode,
        );
    }

    private static async handleSuccessfulVerification(
        interaction: ModalSubmitInteraction,
    ): Promise<void> {
        if (
            !interaction.guild
        ) {
            return;
        }

        const member =
            interaction.guild.members.cache.get(
                interaction.user.id,
            ) ??
            await interaction.guild.members.fetch(
                interaction.user.id,
            );

        await VerificationRoleService.grantVerifiedRole(
            interaction.guild,
            member,
        );

        VerificationAttemptService.reset(
            interaction.guild.id,
            interaction.user.id,
        );

        await this.reply(
            interaction,
            verificationConfig.messages.verified,
        );
    }

    private static formatLockedMessage(
        lockedUntil: number,
    ): string {
        const unixSeconds =
            Math.floor(lockedUntil / 1000);

        return verificationConfig.messages.locked.replace(
            "{EXPIRES}",
            `<t:${unixSeconds}:R>`,
        );
    }

    private static async reply(
        interaction: ButtonInteraction | ModalSubmitInteraction,
        content: string,
    ): Promise<void> {
        const payload: InteractionReplyOptions =
            this.buildEphemeralPayload(content);

        await interaction.reply(payload);
    }

    private static async replyOrFollowUp(
        interaction: ModalSubmitInteraction,
        content: string,
    ): Promise<void> {
        const payload: InteractionReplyOptions =
            this.buildEphemeralPayload(content);

        if (
            interaction.replied ||
            interaction.deferred
        ) {
            await interaction.followUp(payload);
        } else {
            await interaction.reply(payload);
        }
    }

    private static buildEphemeralPayload(
        content: string,
    ): InteractionReplyOptions {
        return {
            content,
            flags: MessageFlags.Ephemeral,
        };
    }
}