import {
    ChannelType,
    OverwriteType,
    PermissionFlagsBits,
    type Guild,
    type GuildMember,
    type GuildTextBasedChannel,
    type OverwriteResolvable,
    type PrivateThreadChannel,
} from "discord.js";

import { logger } from "../../core/utils/logger.js";
import type { TicketCategoryConfig } from "./tickets.types.js";

export type TicketChannel = GuildTextBasedChannel | PrivateThreadChannel;

const MAX_CHANNEL_NAME_LENGTH = 100;
const MAX_NAME_PART_LENGTH = 40;

export class TicketChannelService {
    public static async create(
        guild: Guild,
        category: TicketCategoryConfig,
        owner: GuildMember,
    ): Promise<TicketChannel> {
        const name = this.buildName(category.channelPrefix, owner.displayName);

        if (category.location.type === "thread") {
            return this.createThread(guild, category, owner, name);
        }

        return this.createChannel(guild, category, owner, name);
    }

    public static buildName(leftPart: string, ownerNick: string): string {
        const name = `${this.sanitizeNamePart(leftPart)}-${this.sanitizeNamePart(ownerNick)}`;

        return name.slice(0, MAX_CHANNEL_NAME_LENGTH);
    }

    private static sanitizeNamePart(value: string): string {
        const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");
        const cleaned = normalized.replace(/[^\p{L}\p{N}_-]/gu, "");

        return cleaned.slice(0, MAX_NAME_PART_LENGTH) || "user";
    }

    private static async createChannel(
        guild: Guild,
        category: TicketCategoryConfig,
        owner: GuildMember,
        name: string,
    ): Promise<GuildTextBasedChannel> {
        const parentId = category.location.parentCategoryId;

        if (!parentId) {
            throw new Error("TICKET_CATEGORY_PARENT_NOT_CONFIGURED");
        }

        const botMemberId = guild.members.me?.id;

        const overwrites: OverwriteResolvable[] = [
            {
                id: guild.roles.everyone.id,
                type: OverwriteType.Role,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: owner.id,
                type: OverwriteType.Member,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles,
                ],
            },
            ...category.staffRoles.map(
                (staffRole): OverwriteResolvable => ({
                    id: staffRole.roleId,
                    type: OverwriteType.Role,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                    ],
                }),
            ),
        ];

        if (botMemberId) {
            overwrites.push({
                id: botMemberId,
                type: OverwriteType.Member,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageMessages,
                ],
            });
        }

        const channel = await guild.channels.create({
            name,
            type: ChannelType.GuildText,
            parent: parentId,
            permissionOverwrites: overwrites,
        });

        return channel;
    }

    private static async createThread(
        guild: Guild,
        category: TicketCategoryConfig,
        owner: GuildMember,
        name: string,
    ): Promise<PrivateThreadChannel> {
        const parentChannelId = category.location.parentChannelId;

        if (!parentChannelId) {
            throw new Error("TICKET_THREAD_PARENT_NOT_CONFIGURED");
        }

        const parentChannel =
            guild.channels.cache.get(parentChannelId) ??
            (await guild.channels.fetch(parentChannelId));

        if (!parentChannel || parentChannel.type !== ChannelType.GuildText) {
            throw new Error("TICKET_THREAD_PARENT_NOT_FOUND");
        }

        const thread = (await parentChannel.threads.create({
            name,
            type: ChannelType.PrivateThread,
            invitable: false,
            reason: `Ticket: ${category.select.label} (${owner.user.tag})`,
        })) as PrivateThreadChannel;

        await thread.members.add(owner.id).catch((error: unknown) => {
            logger.error(
                `Nie udało się dodać zainteresowanego (${owner.id}) do wątku ticketa:`,
                error,
            );
        });

        for (const staffRole of category.staffRoles) {
            const role = guild.roles.cache.get(staffRole.roleId);

            if (!role) {
                logger.warn(
                    `Rola administracyjna ${staffRole.roleId} skonfigurowana dla kategorii "${category.key}" nie istnieje.`,
                );

                continue;
            }

            for (const member of role.members.values()) {
                await thread.members.add(member.id).catch((error: unknown) => {
                    logger.error(
                        `Nie udało się dodać ${member.id} do wątku ticketa:`,
                        error,
                    );
                });
            }
        }

        return thread;
    }
}
