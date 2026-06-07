import { PrismaClient } from '@prisma/client';
import { ITicketRepository, IPaymentSummary } from './ticket.repository.interface';
import { ITicket } from '../types';

export class TicketRepository implements ITicketRepository {
    constructor(private readonly db: PrismaClient) {}

    public create = async (eventId: string, eventeeId: string, initialAmount: number, reference: string): Promise<ITicket> => {
      const record = await this.db.ticket.create({
          data: {
              eventId,
              eventeeId,
              amountPaid: initialAmount,
              reference
          },
      });
      return this.mapToTicket(record);
    }

    public async findById(id: string): Promise<ITicket | null> {
        const record = await this.db.ticket.findUnique({ where: { id } });
        return record ? this.mapToTicket(record) : null;
    }


   public async findByTicketId(ticketId: string): Promise<ITicket | null> {
        const record = await this.db.ticket.findUnique({ where: { id: ticketId } });
        return record ? this.mapToTicket(record) : null;
    }

    public async findByEvent(eventId: string): Promise<ITicket[]> {
        const records = await this.db.ticket.findMany({ where: { eventId } });
        return records.map((r) => this.mapToTicket(r));
        
    }
    public async findByEventee(eventeeId: string): Promise<ITicket[]> {
        const records = await this.db.ticket.findMany({ where: { eventeeId } });
        return records.map((r) => this.mapToTicket(r));
    }
    public async verifyAndMarkScanned(id: string, eventId: string): Promise<ITicket> {
        const existing = await this.db.ticket.findUnique({ where: { id } });
        if (!existing) throw new Error('TICKET_NOT_FOUND');
        if (existing.eventId !== eventId) throw new Error('TICKET_EVENT_MISMATCH');
        if (existing.isScanned) throw new Error('TICKET_ALREADY_SCANNED');

        const record = await this.db.ticket.update({
            where: { id },
            data: { isScanned: true },
        });
        return this.mapToTicket(record);
    }

    public async markAsPaid(id: string): Promise<ITicket> {
        const record = await this.db.ticket.update({
            where: { id },
            data: { isPaid: true },
        });
        return this.mapToTicket(record);
    }

    public async findByEventandEventee(eventId:string, eventeeId:string): Promise<ITicket | null> {
        const record = await this.db.ticket.findFirst({
            where: { eventId, eventeeId }
        });
        return record ? this.mapToTicket(record): null;
    }

    public async updateQrCode(id: string, qrCodeUrl: string): Promise<ITicket> {
    const record = await this.db.ticket.update({
        where: { id },
        data: { qrCodeUrl },
    });
    return this.mapToTicket(record);
}

public async updateTicketStatus(ticketId: string, isPaid: boolean): Promise<ITicket> {
    const record = await this.db.ticket.update({
        where: { id: ticketId },
        data: { isPaid },
    });
    return this.mapToTicket(record);
}


public async countPaidTicketsTotal(): Promise<number> {
    return this.db.ticket.count({ where: { isPaid: true } });
}

public async countPaidTicketsByEvent(eventId: string): Promise<number> {
    return this.db.ticket.count({
        where: { eventId, isPaid: true }
    });
}

public async countScannedTicketsByEvent(eventId: string): Promise<number> {
    return this.db.ticket.count({
        where: { eventId, isScanned: true }
    });
}

public async getPaymentSummary(eventId: string): Promise<IPaymentSummary[]> {
    const records = await this.db.ticket.findMany({
        where: {
            eventId,
            isPaid: true,
        },
        select: {
            id: true,
            eventId: true,
            eventeeId: true,
            amountPaid: true,
            createdAt: true,
        },
    });
    return records.map((r) => ({
        ticketId: r.id,
        eventId: r.eventId,
        eventeeId: r.eventeeId,
        amountPaid: r.amountPaid,
        createdAt: r.createdAt,
    }));
}


public async findByReference(reference: string): Promise<ITicket | null> {
    const record = await this.db.ticket.findFirst({ where: { reference } });
    return record ? this.mapToTicket(record) : null;
}

private mapToTicket(record: {
    id: string;
    eventId: string;
    eventeeId: string;
    qrCodeUrl: string | null;
    reference: string | null;
    isPaid: boolean;
    isScanned: boolean;
    amountPaid: number;
    createdAt: Date;
}): ITicket {
    return {
        id: record.id,
        eventId: record.eventId,
        eventeeId: record.eventeeId,
        qrCodeUrl: record.qrCodeUrl,
        reference: record.reference,
        isPaid: record.isPaid,
        isScanned: record.isScanned,
        amountPaid: record.amountPaid,
        createdAt: record.createdAt,
    };
}


}
