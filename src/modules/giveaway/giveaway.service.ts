import type { Giveaway } from "../../../generated/prisma/client.js";

import { prisma } from "../../core/database/prisma.js";
import { GiveawayIdService } from "./giveaway-id.service.js";
import { GIVEAWAY_STATUS } from "./giveaway.types.js";
import type { CreateGiveawayInput } from "./giveaway.types.js";

export type EntryResult = "joined" | "already-joined";
export type LeaveResult = "left" | "not-joined";

export class GiveawayService {
    public static async create(
        input: CreateGiveawayInput,
    ): Promise<Giveaway> {
        const id = await GiveawayIdService.generateUnique();

        return prisma.giveaway.create({
            data: {
                id,
                guildId: input.guildId,
                channelId: input.channelId,
                hostId: input.hostId,
                prize: input.prize,
                winnerCount: input.winnerCount,
                endsAt: input.endsAt,
                status: GIVEAWAY_STATUS.active,
            },
        });
    }

    public static findById(
        id: string,
    ): Promise<Giveaway | null> {
        return prisma.giveaway.findUnique({
            where: {
                id,
            },
        });
    }

    public static async setMessageId(
        id: string,
        messageId: string,
    ): Promise<void> {
        await prisma.giveaway.update({
            where: {
                id,
            },
            data: {
                messageId,
            },
        });
    }

    public static async setEndsAt(
        id: string,
        endsAt: Date,
    ): Promise<void> {
        await prisma.giveaway.update({
            where: {
                id,
            },
            data: {
                endsAt,
            },
        });
    }

    public static async setWinnerCount(
        id: string,
        winnerCount: number,
    ): Promise<void> {
        await prisma.giveaway.update({
            where: {
                id,
            },
            data: {
                winnerCount,
            },
        });
    }

    public static async markEnded(
        id: string,
    ): Promise<void> {
        await prisma.giveaway.update({
            where: {
                id,
            },
            data: {
                status: GIVEAWAY_STATUS.ended,
                endedAt: new Date(),
            },
        });
    }

    public static async markCancelled(
        id: string,
    ): Promise<void> {
        await prisma.giveaway.update({
            where: {
                id,
            },
            data: {
                status: GIVEAWAY_STATUS.cancelled,
                endedAt: new Date(),
            },
        });
    }

    /**
     * Zwraca wszystkie aktywne konkursy — używane przy starcie bota,
     * żeby zaplanować/dogrywać timery po restarcie.
     */
    public static findAllActive(): Promise<Giveaway[]> {
        return prisma.giveaway.findMany({
            where: {
                status: GIVEAWAY_STATUS.active,
            },
        });
    }

    /**
     * Aktywne konkursy, których czas już minął — sprzątane przez
     * cykliczny sweep (siatka bezpieczeństwa na wypadek przestoju bota
     * albo bardzo długich konkursów przekraczających limit setTimeout).
     */
    public static findExpiredActive(): Promise<Giveaway[]> {
        return prisma.giveaway.findMany({
            where: {
                status: GIVEAWAY_STATUS.active,
                endsAt: {
                    lte: new Date(),
                },
            },
        });
    }

    public static async addEntry(
        giveawayId: string,
        userId: string,
    ): Promise<EntryResult> {
        try {
            await prisma.giveawayEntry.create({
                data: {
                    giveawayId,
                    userId,
                },
            });

            return "joined";
        } catch (error) {
            if (this.isUniqueConstraintError(error)) {
                return "already-joined";
            }

            throw error;
        }
    }

    public static async removeEntry(
        giveawayId: string,
        userId: string,
    ): Promise<LeaveResult> {
        const result = await prisma.giveawayEntry.deleteMany({
            where: {
                giveawayId,
                userId,
            },
        });

        return result.count > 0 ? "left" : "not-joined";
    }

    public static hasEntry(
        giveawayId: string,
        userId: string,
    ): Promise<boolean> {
        return prisma.giveawayEntry
            .findUnique({
                where: {
                    giveawayId_userId: {
                        giveawayId,
                        userId,
                    },
                },
                select: {
                    id: true,
                },
            })
            .then((entry) => entry !== null);
    }

    public static countEntries(
        giveawayId: string,
    ): Promise<number> {
        return prisma.giveawayEntry.count({
            where: {
                giveawayId,
            },
        });
    }

    public static async listEntryUserIds(
        giveawayId: string,
    ): Promise<string[]> {
        const entries = await prisma.giveawayEntry.findMany({
            where: {
                giveawayId,
            },
            select: {
                userId: true,
            },
        });

        return entries.map((entry) => entry.userId);
    }

    public static async listWinnerUserIds(
        giveawayId: string,
    ): Promise<string[]> {
        const winners = await prisma.giveawayWinner.findMany({
            where: {
                giveawayId,
            },
            select: {
                userId: true,
            },
        });

        return winners.map((winner) => winner.userId);
    }

    public static async addWinners(
        giveawayId: string,
        userIds: string[],
        rerolled: boolean,
    ): Promise<void> {
        if (userIds.length === 0) {
            return;
        }

        await prisma.giveawayWinner.createMany({
            data: userIds.map((userId) => ({
                giveawayId,
                userId,
                rerolled,
            })),
        });
    }

    /**
     * Losuje `count` unikalnych zwycięzców z puli uczestników,
     * pomijając tych, którzy już wcześniej wygrali (istotne przy
     * rerollu — dogrywani są dodatkowi, różni zwycięzcy).
     */
    public static pickRandomWinners(
        entryUserIds: string[],
        excludeUserIds: string[],
        count: number,
    ): string[] {
        const excluded = new Set(excludeUserIds);

        const pool = entryUserIds.filter(
            (userId) => !excluded.has(userId),
        );

        this.shuffle(pool);

        return pool.slice(0, count);
    }

    private static shuffle(items: string[]): void {
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [items[i], items[j]] = [items[j]!, items[i]!];
        }
    }

    private static isUniqueConstraintError(
        error: unknown,
    ): boolean {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code: unknown }).code === "P2002"
        );
    }
}
