import type { Giveaway } from "../../../generated/prisma/client.js";
import type { Bot } from "../../core/bot.js";

import { giveawayConfig } from "../../../config/modules/giveaway.config.js";
import { logger } from "../../core/utils/logger.js";
import { MAX_SAFE_TIMEOUT_MS } from "./giveaway.constants.js";
import { GiveawayService } from "./giveaway.service.js";

/**
 * Odpowiada wyłącznie za "kiedy" konkurs ma się zakończyć.
 * Faktyczne losowanie zwycięzców i aktualizacja wiadomości leży
 * po stronie GiveawayController.resolve().
 *
 * Dwa mechanizmy działają razem:
 * - pojedynczy `setTimeout` na konkurs, dla precyzyjnego zakończenia
 *   "na czas" (o ile mieści się w limicie Node.js, ~24.8 dnia),
 * - cykliczny sweep bazy danych, który dogrywa wszystko, co z jakiegoś
 *   powodu nie zostało zakończone na czas (restart bota, bardzo
 *   długi konkurs, awaria timera).
 */
export class GiveawayScheduler {
    private static readonly timers = new Map<
        string,
        NodeJS.Timeout
    >();

    private static sweepInterval: NodeJS.Timeout | null = null;
    private static onExpire:
        | ((giveawayId: string) => Promise<void>)
        | null = null;

    public static initialize(
        bot: Bot,
        onExpire: (giveawayId: string) => Promise<void>,
    ): void {
        this.onExpire = onExpire;

        this.startSweeper();

        void this.rescheduleAllActive(bot);
    }

    public static schedule(giveaway: Giveaway): void {
        this.clear(giveaway.id);

        const delay = giveaway.endsAt.getTime() - Date.now();

        if (delay <= 0) {
            void this.trigger(giveaway.id);

            return;
        }

        if (delay > MAX_SAFE_TIMEOUT_MS) {
            return;
        }

        const timer = setTimeout(() => {
            void this.trigger(giveaway.id);
        }, delay);

        this.timers.set(giveaway.id, timer);
    }

    public static clear(giveawayId: string): void {
        const timer = this.timers.get(giveawayId);

        if (timer) {
            clearTimeout(timer);
            this.timers.delete(giveawayId);
        }
    }

    private static async trigger(
        giveawayId: string,
    ): Promise<void> {
        this.timers.delete(giveawayId);

        try {
            await this.onExpire?.(giveawayId);
        } catch (error) {
            logger.error(
                `Błąd podczas kończenia konkursu ${giveawayId}:`,
                error,
            );
        }
    }

    private static async rescheduleAllActive(
        _bot: Bot,
    ): Promise<void> {
        const active = await GiveawayService.findAllActive();

        for (const giveaway of active) {
            this.schedule(giveaway);
        }

        logger.info(
            `Zaplanowano zakończenie ${active.length} aktywnych konkursów`,
        );
    }

    private static startSweeper(): void {
        if (this.sweepInterval) {
            return;
        }

        this.sweepInterval = setInterval(() => {
            void this.sweep();
        }, giveawayConfig.sweepIntervalSeconds * 1000);
    }

    private static async sweep(): Promise<void> {
        const expired = await GiveawayService.findExpiredActive();

        for (const giveaway of expired) {
            await this.trigger(giveaway.id);
        }
    }
}
