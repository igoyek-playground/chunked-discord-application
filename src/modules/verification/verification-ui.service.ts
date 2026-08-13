import {
    ButtonBuilder,
    ContainerBuilder,
    LabelBuilder,
    MessageFlags,
    ModalBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle,
    type InteractionReplyOptions,
    type MessageCreateOptions,
} from "discord.js";

import { verificationConfig } from "../../../config/modules/verification.config.js";
import { VERIFICATION_CUSTOM_IDS } from "./verification.constants.js";

export class VerificationUiService {
    public static createPanel(): MessageCreateOptions {
    const button =
        new ButtonBuilder()
            .setCustomId(
                VERIFICATION_CUSTOM_IDS.verifyButton,
            )
            .setLabel(
                verificationConfig.panel.button.label,
            )
            .setStyle(
                verificationConfig.panel.button.style,
            );

    if (verificationConfig.panel.button.emoji) {
        button.setEmoji(
            verificationConfig.panel.button.emoji,
        );
    }

    const section =
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `## ${verificationConfig.panel.title}\n\n` +
                        verificationConfig.panel.description,
                    ),
            )
            .setButtonAccessory(button);

    const container =
        new ContainerBuilder()
            .setAccentColor(
                verificationConfig.panel.accentColor,
            )
            .addSectionComponents(
                section,
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `-# ${verificationConfig.panel.footer}`,
                    ),
            );

    return {
        flags: MessageFlags.IsComponentsV2,
        components: [
            container,
        ],
    };
}

    public static createModal(
        code: string,
    ): ModalBuilder {
        const codeDisplay =
            new TextDisplayBuilder()
                .setContent(
                    verificationConfig.modal.codeText.replace(
                        "{CODE}",
                        code,
                    ),
                );

        const textInput =
            new TextInputBuilder()
                .setCustomId(
                    VERIFICATION_CUSTOM_IDS.codeInput,
                )
                .setStyle(
                    TextInputStyle.Short,
                )
                .setRequired(true)
                .setMinLength(
                    verificationConfig.code.length,
                )
                .setMaxLength(
                    verificationConfig.code.length,
                )
                .setPlaceholder(
                    verificationConfig.modal.input.placeholder,
                );

        const label =
            new LabelBuilder()
                .setLabel(
                    verificationConfig.modal.input.label,
                )
                .setDescription(
                    verificationConfig.modal.input.description,
                )
                .setTextInputComponent(
                    textInput,
                );

        return new ModalBuilder()
            .setCustomId(
                VERIFICATION_CUSTOM_IDS.verifyModal,
            )
            .setTitle(
                verificationConfig.modal.title,
            )
            .addTextDisplayComponents(
                codeDisplay,
            )
            .addLabelComponents(
                label,
            );
    }

    public static createEphemeralMessage(
        message: string,
    ): InteractionReplyOptions {
        const text =
            new TextDisplayBuilder()
                .setContent(message);

        return {
            flags:
                MessageFlags.Ephemeral |
                MessageFlags.IsComponentsV2,

            components: [
                text,
            ],
        };
    }
}