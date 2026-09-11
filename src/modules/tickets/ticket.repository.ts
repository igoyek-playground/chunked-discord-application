import { prisma } from "../../core/database/prisma.js";
import type { TicketStatus } from "./tickets.types.js";

export interface TicketRecord {
    id: number;
    guildId: string;
    channelId: string;
    categoryKey: string;
    ownerId: string;
    claimedById: string | null;
    status: TicketStatus;
    createdAt: Date;
    closedAt: Date | null;
    closedById: string | null;
}

interface RawTicketRow {
    id: number;
    guildId: string;
    channelId: string;
    categoryKey: string;
    ownerId: string;
    claimedById: string | null;
    status: string;
    createdAt: Date;
    closedAt: Date | null;
    closedById: string | null;
}

function toTicketRecord(row: RawTicketRow): TicketRecord {
    return {
        ...row,
        status: row.status as TicketStatus,
    };
}

export class TicketRepository {
    public static async create(
        guildId: string,
        channelId: string,
        categoryKey: string,
        ownerId: string,
    ): Promise<TicketRecord> {
        const row = await prisma.ticket.create({
            data: {
                guildId,
                channelId,
                categoryKey,
                ownerId,
            },
        });

        return toTicketRecord(row);
    }

    public static async findByChannelId(
        channelId: string,
    ): Promise<TicketRecord | null> {
        const row = await prisma.ticket.findUnique({
            where: { channelId },
        });

        return row ? toTicketRecord(row) : null;
    }

    public static async countOpen(
        guildId: string,
        ownerId: string,
        categoryKey?: string,
    ): Promise<number> {
        return prisma.ticket.count({
            where: {
                guildId,
                ownerId,
                status: "open",
                ...(categoryKey ? { categoryKey } : {}),
            },
        });
    }

    public static async markClaimed(
        channelId: string,
        claimedById: string,
    ): Promise<void> {
        await prisma.ticket.update({
            where: { channelId },
            data: { claimedById },
        });
    }

    public static async markClosed(
        channelId: string,
        closedById: string,
    ): Promise<void> {
        await prisma.ticket.update({
            where: { channelId },
            data: {
                status: "closed",
                closedAt: new Date(),
                closedById,
            },
        });
    }
}
