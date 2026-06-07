import { Redis } from 'ioredis';
import { ITicketRepository } from "./ticket.repository.interface";
import { IOverallAnalytics, ISpecificEventAnalytics } from "../types";

export class AnalyticsService {
    constructor(private readonly ticketRepo: ITicketRepository, private readonly cache: Redis) {}

    public getOverallMetrics = async (): Promise<IOverallAnalytics> => {
        const cacheKey = 'cache:analytics:global';
        const cached = await this.cache.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const totalTicketsBought = await this.ticketRepo.countPaidTicketsTotal();

        const payload: IOverallAnalytics = {
            totalEvents: 0,
            totalAttendeesCount: totalTicketsBought
        };

        await this.cache.set(cacheKey, JSON.stringify(payload), 'EX', 60);
        return payload;
    };

    public getSpecificEventMetrics = async (eventId: string): Promise<ISpecificEventAnalytics> => {
        const cacheKey = `cache:analytics:event:${eventId}`
        const cached = await this.cache.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const [sold, scanned] = await Promise.all([
            this.ticketRepo.countPaidTicketsByEvent(eventId),
            this.ticketRepo.countScannedTicketsByEvent(eventId)
        ]);

        const payload: ISpecificEventAnalytics = {
            eventId,
            ticketsSold: sold,
            qrScannedCount: scanned
        };

        await this.cache.set(cacheKey, JSON.stringify(payload), 'EX', 30);
        return payload;
    }
}