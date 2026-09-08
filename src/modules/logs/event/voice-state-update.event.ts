import { Events } from "discord.js";

import { defineEvent } from "../../../core/structures/event.structure.js";
import { VoiceLogsService } from "../voice-logs.service.js";

export default defineEvent({
    name: Events.VoiceStateUpdate,

    async execute(_bot, oldState, newState) {
        await VoiceLogsService.logVoiceStateUpdate(oldState, newState);
    },
});
