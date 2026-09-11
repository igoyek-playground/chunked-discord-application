import { ticketsConfig } from "../../../config/modules/tickets.config.js";
import { TicketRepository } from "./ticket.repository.js";

export class TicketLimitService {
    public static async hasReachedLimit(
        guildId: string,
        ownerId: string,
        categoryKey: string,
    ): Promise<boolean> {
        const { maxOpenTicketsPerUser, limitAppliesAcrossAllCategories } =
            ticketsConfig.limits;

        if (maxOpenTicketsPerUser <= 0) {
            return false;
        }

        const openCount = await TicketRepository.countOpen(
            guildId,
            ownerId,
            limitAppliesAcrossAllCategories ? undefined : categoryKey,
        );

        return openCount >= maxOpenTicketsPerUser;
    }
}
