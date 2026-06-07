import { ITicket } from '../types';

export interface IPaymentSummary {
    ticketId: string;
    eventId: string;
    eventeeId: string;
    amountPaid: number;
    createdAt: Date;
}

export interface ITicketRepository {
    create(eventId: string, eventeeId: string, initialAmount: number, reference: string): Promise<ITicket>;
    findById(id: string): Promise<ITicket | null>
    findByEvent(eventId: string): Promise<ITicket[]>;
    findByEventee(eventeeId: string): Promise<ITicket[]>;
    findByEventandEventee(eventId: string, eventeeId: string): Promise<ITicket | null>;
    markAsPaid(id: string): Promise<ITicket>;
    findByTicketId(ticketId: string): Promise<ITicket | null>;
    updateQrCode(id: string, qrCodeUrl: string): Promise<ITicket>;
    updateTicketStatus(ticketId: string, isPaid: boolean): Promise<ITicket>;
    verifyAndMarkScanned(id: string, eventId: string): Promise<ITicket>;
    countPaidTicketsTotal(): Promise<number>;
    countPaidTicketsByEvent(eventId: string): Promise<number>;
    countScannedTicketsByEvent(eventId: string): Promise<number>;
    getPaymentSummary(eventId: string): Promise<IPaymentSummary[]>;
    findByReference(reference: string): Promise<ITicket | null>;
}