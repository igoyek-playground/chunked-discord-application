import { OverwriteType } from "discord.js";

import type { TicketChannel } from "./ticket-channel.service.js";

export class TicketAccessService {
    public static async addUser(
        channel: TicketChannel,
        userId: string,
    ): Promise<void> {
        if (channel.isThread()) {
            await channel.members.add(userId);

            return;
        }

        await channel.permissionOverwrites.edit(
            userId,
            {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true,
            },
            { type: OverwriteType.Member },
        );
    }
}
