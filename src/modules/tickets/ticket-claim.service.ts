import {
    OverwriteType,
    type AnyThreadChannel,
    type GuildMember,
    type NonThreadGuildBasedChannel,
} from "discord.js";

import { ticketsConfig } from "../../../config/modules/tickets.config.js";
import { logger } from "../../core/utils/logger.js";
import type { TicketChannel } from "./ticket-channel.service.js";
import { TicketChannelService } from "./ticket-channel.service.js";
import type { TicketCategoryConfig } from "./tickets.types.js";

export interface ClaimResult {
    newName: string;
    fellBackToIsolate: boolean;
}

export class TicketClaimService {
    public static async claim(
        channel: TicketChannel,
        category: TicketCategoryConfig,
        claimer: GuildMember,
        owner: GuildMember,
    ): Promise<ClaimResult> {
        const newName = TicketChannelService.buildName(
            claimer.displayName,
            owner.displayName,
        );

        await channel.setName(newName);

        const fellBackToIsolate = await this.applyClaimMode(
            channel,
            category,
            claimer.id,
            owner.id,
        );

        return { newName, fellBackToIsolate };
    }

    private static async applyClaimMode(
        channel: TicketChannel,
        category: TicketCategoryConfig,
        claimerId: string,
        ownerId: string,
    ): Promise<boolean> {
        const { mode } = ticketsConfig.claim;

        if (mode === "silent") {
            return false;
        }

        if (channel.isThread()) {
            await this.isolateThread(channel, claimerId, ownerId);

            return mode === "readOnlyOthers";
        }

        if (mode === "isolateOthers") {
            await this.isolateChannel(channel, category, claimerId);

            return false;
        }

        await this.makeChannelReadOnlyForOthers(channel, category, claimerId);

        return false;
    }

    private static async isolateThread(
        channel: AnyThreadChannel,
        claimerId: string,
        ownerId: string,
    ): Promise<void> {
        const members = await channel.members.fetch();

        for (const member of members.values()) {
            if (
                member.id === claimerId ||
                member.id === ownerId ||
                member.id === channel.client.user.id
            ) {
                continue;
            }

            await channel.members.remove(member.id).catch((error: unknown) => {
                logger.error(
                    `Nie udało się usunąć ${member.id} z wątku ticketa po przejęciu:`,
                    error,
                );
            });
        }

        await channel.members.add(claimerId).catch(() => {});
    }

    private static async isolateChannel(
        channel: NonThreadGuildBasedChannel,
        category: TicketCategoryConfig,
        claimerId: string,
    ): Promise<void> {
        for (const staffRole of category.staffRoles) {
            await channel.permissionOverwrites
                .edit(
                    staffRole.roleId,
                    { ViewChannel: false },
                    { type: OverwriteType.Role },
                )
                .catch((error: unknown) => {
                    logger.error(
                        `Nie udało się zablokować roli ${staffRole.roleId} po przejęciu ticketa:`,
                        error,
                    );
                });
        }

        await channel.permissionOverwrites.edit(
            claimerId,
            {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
            },
            { type: OverwriteType.Member },
        );
    }

    private static async makeChannelReadOnlyForOthers(
        channel: NonThreadGuildBasedChannel,
        category: TicketCategoryConfig,
        claimerId: string,
    ): Promise<void> {
        for (const staffRole of category.staffRoles) {
            await channel.permissionOverwrites
                .edit(
                    staffRole.roleId,
                    { SendMessages: false },
                    { type: OverwriteType.Role },
                )
                .catch((error: unknown) => {
                    logger.error(
                        `Nie udało się ograniczyć roli ${staffRole.roleId} po przejęciu ticketa:`,
                        error,
                    );
                });
        }

        await channel.permissionOverwrites.edit(
            claimerId,
            {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
            },
            { type: OverwriteType.Member },
        );
    }
}
