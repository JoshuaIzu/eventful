import { PrismaClient } from "@prisma/client";
import { IEventRepository } from './event.repository.interface'
import { IEvent, ICreateEventDTO, ReminderType, PricingType } from "../types";


export class EventRepository implements IEventRepository {
    constructor(private readonly db: PrismaClient) {}

    public async findById(id: string): Promise<IEvent | null> {
        const record = await this.db.event.findUnique({ where: { id } });
        if (!record) return null;
        return this.mapToEvent(record);
    }

    public async findAll():Promise<IEvent[]> {
        const records = await this.db.event.findMany({
            orderBy: {date: 'asc'},
        });
        return records.map((r)=> this.mapToEvent(r));
    }

    public async create(creatorId: string, dto: ICreateEventDTO, calculatedPrice: number): Promise<IEvent> {
        const record = await this.db.event.create({
            data: {
                title: dto.title,
                description: dto.description,
                date: new Date(dto.date),
                creatorId,
                basePrice: dto.basePrice,
                calculatedPrice,
                reminderType: dto.reminderType,
                pricingType: dto.pricingType,
            },
        });
        return this.mapToEvent(record);
    }
     public async findByCreatorId(creatorId: string): Promise<IEvent[]> {
        const records = await this.db.event.findMany({
            where: { creatorId },
            orderBy: { date: 'asc' },
        })
        return records.map((r) => this.mapToEvent(r));
    }

    private mapToEvent(record: {
        id: string;
        title: string;
        description: string;
        date: Date;
        creatorId: string;
        basePrice: number;
        calculatedPrice: number;
        reminderType: string;
        pricingType: string;
        createdAt: Date;
    }): IEvent {
        return {
            id: record.id,
            title: record.title,
            description: record.description,
            date: record.date,
            creatorId: record.creatorId,
            basePrice: record.basePrice,
            calculatedPrice: record.calculatedPrice,
            reminderType: record.reminderType as ReminderType,
            pricingType: record.pricingType as PricingType,
            createdAt: record.createdAt,
        };
    }
}