import type {
    ButtonInteraction,
    GuildTextBasedChannel,
    ModalSubmitInteraction,
} from "discord.js";

import { verificationConfig } from "../../../config/modules/verification.config.js";
import { logger } from "../../core/utils/logger.js";
import { VerificationCodeService } from "./verification-code.service.js";
import { VERIFICATION_CUSTOM_IDS } from "./verification.constants.js";
import { VerificationService } from "./verification.service.js";
import { VerificationSessionService } from "./verification-session.service.js";
import { VerificationUiService } from "./verification-ui.service.js";

export class VerificationController {
    public static async sendPanel(
        channel: GuildTextBasedChannel,
    ): Promise<void> {
        VerificationUiService.createPanel();
    }

    public static async handleVerifyButton(
        interaction: ButtonInteraction,
    ): Promise<void> {
        if (!verificationConfig.enabled) {
            await interaction.reply(
                VerificationUiService.createEphemeralMessage(
                    verificationConfig.messages.disabled,
                ),
            );

            return;
        }

        if (
            !interaction.inGuild() ||
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

        if (
            member.roles.cache.has(
                verificationConfig.verifiedRoleId,
            )
        ) {
            await interaction.reply(
                VerificationUiService.createEphemeralMessage(
                    verificationConfig.messages.alreadyVerified,
                ),
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
            VerificationUiService.createModal(
                code,
            ),
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
                await interaction.reply(
                    VerificationUiService.createEphemeralMessage(
                        verificationConfig.messages.expiredCode,
                    ),
                );

                return;
            }

            if (result === "invalid") {
                await interaction.reply(
                    VerificationUiService.createEphemeralMessage(
                        verificationConfig.messages.invalidCode,
                    ),
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

            await VerificationService.grantVerifiedRole(
                interaction.guild,
                member,
            );

            await interaction.reply(
                VerificationUiService.createEphemeralMessage(
                    verificationConfig.messages.verified,
                ),
            );
        } catch (error) {
            logger.error(
                "Błąd podczas weryfikacji użytkownika:",
                error,
            );

            let message =
                verificationConfig.messages.internalError;

            if (
                error instanceof Error &&
                error.message ===
                    "VERIFICATION_ROLE_NOT_FOUND"
            ) {
                message =
                    verificationConfig.messages.missingRole;
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
                message =
                    verificationConfig.messages.roleHierarchyError;
            }

            const payload =
                VerificationUiService.createEphemeralMessage(
                    message,
                );

            if (
                interaction.replied ||
                interaction.deferred
            ) {
                await interaction.followUp(
                    payload,
                );
            } else {
                await interaction.reply(
                    payload,
                );
            }
        }
    }
}