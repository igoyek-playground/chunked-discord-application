import { MessageFlags } from "discord.js";

import { defineEvent } from "../structures/event.structure.js";
import { logger } from "../utils/logger.js";

export default defineEvent({
    name: "interactionCreate",

    async execute(bot, interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = bot.commands.get(
            interaction.commandName,
        );

        if (!command) {
            logger.warn(`Otrzymano nieznaną komendę: ${interaction.commandName}`);
            return;
        }

        if (
            command.userPermissions?.length
            && interaction.inGuild()
        ) {
            const missing =
                interaction.memberPermissions?.missing(
                command.userPermissions,
                ) ?? [];

            if (missing.length > 0) {
                await interaction.reply({
                    content:
                        `\`[  ✘  ]\` Nie masz wymaganych uprawnień: ` +
                        `(\`${missing.join(", ")}\`)`,
                    flags: MessageFlags.Ephemeral,
                });

                return;
            }
        }

        if (
            command.botPermissions?.length
            && interaction.inGuild()
        ) {
            const missing = interaction.appPermissions?.missing(command.botPermissions) ?? [];

            if (missing.length > 0) {
                await interaction.reply({
                    content:
                        `\`[  ✘  ]\` Bot nie posiada wymaganych uprawnień: ` +
                        `(\`${missing.join(", ")}\`)`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        try {
            await command.execute(
                interaction,
                bot,
            );
        } catch (error) {
            logger.error(
                `Błąd podczas wykonywania komendy "${command.data.name}":`,
                error,
            );

            const errorPayload = {
                content:
                "❌ Wystąpił błąd podczas wykonywania tej komendy.",
                flags: MessageFlags.Ephemeral,
            } as const;

            if (
                interaction.replied ||
                interaction.deferred
            ) {
                await interaction.followUp(
                errorPayload,
                );
            } else {
                await interaction.reply(
                errorPayload,
                );
            }
        }
    },
});