import {
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnectionStatus,
} from "@discordjs/voice";

import type {
    Guild,
    StageChannel,
    VoiceChannel,
} from "discord.js";

const READY_TIMEOUT_MS = 20_000;

export type VoiceJoinResult =
    | { status: "joined" | "moved" }
    | { status: "error"; message: string };

export class BehaviorVoiceService {
    public static async join(
        channel: VoiceChannel | StageChannel,
    ): Promise<VoiceJoinResult> {
        const wasAlreadyConnected = Boolean(
            getVoiceConnection(channel.guild.id),
        );

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        try {
            await entersState(
                connection,
                VoiceConnectionStatus.Ready,
                READY_TIMEOUT_MS,
            );
        } catch {
            connection.destroy();

            return {
                status: "error",
                message:
                    "Nie udało się połączyć z kanałem głosowym (limit czasu). " +
                    "Sprawdź, czy bot ma uprawnienia `Połącz` i `Mów` na tym kanale.",
            };
        }

        return {
            status: wasAlreadyConnected ? "moved" : "joined",
        };
    }

    public static leave(guild: Guild): boolean {
        const connection = getVoiceConnection(guild.id);

        if (!connection) {
            return false;
        }

        connection.destroy();

        return true;
    }

    public static getCurrentChannelId(
        guild: Guild,
    ): string | null {
        return (
            getVoiceConnection(guild.id)?.joinConfig
                .channelId ?? null
        );
    }
}