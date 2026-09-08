import {
    ButtonBuilder,
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
    TextDisplayBuilder,
    resolveColor,
    type MessageCreateOptions,
} from "discord.js";

import { verificationConfig } from "../../../config/modules/verification.config.js";
import { VERIFICATION_CUSTOM_IDS } from "./verification.constants.js";

export class VerificationPanelBuilder {
    public static build(): MessageCreateOptions {
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
                    resolveColor(
                        verificationConfig.panel.accentColor,
                    ),
                )
                .addSectionComponents(section)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `-# ${verificationConfig.panel.footer}`,
                        ),
                );

        return {
            flags: MessageFlags.IsComponentsV2,
            components: [container],
        };
    }
}