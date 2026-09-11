import {
    LabelBuilder,
    ModalBuilder,
    TextInputBuilder,
} from "discord.js";

import type { TicketCategoryConfig } from "./tickets.types.js";
import { buildModalCustomId } from "./tickets.constants.js";

export class TicketsModalBuilder {
    public static build(category: TicketCategoryConfig): ModalBuilder {
        const modal = new ModalBuilder()
            .setCustomId(buildModalCustomId(category.key))
            .setTitle(category.select.label.slice(0, 45));

        for (const question of category.questions) {
            const textInput = new TextInputBuilder()
                .setCustomId(question.id)
                .setStyle(question.style)
                .setRequired(question.required);

            if (question.placeholder) {
                textInput.setPlaceholder(question.placeholder);
            }

            if (question.minLength !== undefined) {
                textInput.setMinLength(question.minLength);
            }

            if (question.maxLength !== undefined) {
                textInput.setMaxLength(question.maxLength);
            }

            const label = new LabelBuilder()
                .setLabel(question.label)
                .setTextInputComponent(textInput);

            modal.addLabelComponents(label);
        }

        return modal;
    }
}
