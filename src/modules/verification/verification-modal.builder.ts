import {
    LabelBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";

import { verificationConfig } from "../../../config/modules/verification.config.js";
import { VERIFICATION_CUSTOM_IDS } from "./verification.constants.js";

export class VerificationModalBuilder {
    public static build(code: string): ModalBuilder {
        const textInput =
            new TextInputBuilder()
                .setCustomId(
                    VERIFICATION_CUSTOM_IDS.codeInput,
                )
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(code.length)
                .setMaxLength(code.length)
                .setPlaceholder(
                    verificationConfig.modal.input.placeholder,
                );

        const label =
            new LabelBuilder()
                .setLabel(
                    verificationConfig.modal.input.label,
                )
                .setTextInputComponent(textInput);

        return new ModalBuilder()
            .setCustomId(
                VERIFICATION_CUSTOM_IDS.verifyModal,
            )
            .setTitle(
                this.buildTitle(code),
            )
            .addLabelComponents(label);
    }

    private static buildTitle(code: string): string {
        return verificationConfig.modal.titleTemplate.replace(
            "{CODE}",
            code,
        );
    }
}