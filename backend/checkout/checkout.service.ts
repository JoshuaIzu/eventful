import { IEventRepository } from '../events/event.repository.interface';
import { ITicketRepository } from '../events/ticket.repository.interface';
import { IPaymentProvider } from './payment.provider.interface';
import { IInitializePaymentResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { EventSubject } from '../core/event.subject';

export class CheckoutService {
    constructor(
        private readonly eventRepo: IEventRepository,
        private readonly ticketRepo: ITicketRepository,
        private readonly paymentProvider: IPaymentProvider,
        private readonly eventSubject: EventSubject
    ) {}

    public processCheckout = async (
        eventeeId: string,
        email: string,
        eventId: string
    ): Promise<IInitializePaymentResponse> => {
        const event = await this.eventRepo.findById(eventId);
        if (!event) {
            throw new Error('EVENT_NOT_FOUND');
        }


        const reference = `TKT-${uuidv4()}`;

        const ticket = await this.ticketRepo.create(
            eventId,
            eventeeId,
            event.calculatedPrice,
            reference
        );

        // ticketId in metadata allows the webhook to look up the DB record
        return await this.paymentProvider.initializePayment(
            email,
            event.calculatedPrice,
            reference,
            { ticketId: ticket.id }
        );
    };

    public getTicketHistory = async (eventeeId: string) => {
        return await this.ticketRepo.findByEventee(eventeeId);
    };

    public verifyPayment = async (reference: string, eventeeId: string) => {
        const ticket = await this.ticketRepo.findByReference(reference);

        if (!ticket) throw new Error('TICKET_NOT_FOUND');
        if (ticket.eventeeId !== eventeeId) throw new Error('UNAUTHORIZED_ACCESS');

        // Fast path: Webhook already processed it
        if (ticket.isPaid) {
            return { status: 'ALREADY_PAID', ticket };
        }

        // Slow path: Webhook failed/delayed, query Paystack directly
        const isSuccessful = await this.paymentProvider.verifyTransaction(reference);

        if (isSuccessful) {
            const updatedTicket = await this.ticketRepo.updateTicketStatus(ticket.id, true);

            // Fire the exact same decoupled observers as the webhook
            await this.eventSubject.notify('PAYMENT_SUCCESS', {
                ticketId: updatedTicket.id,
                eventId: updatedTicket.eventId,
                eventeeId: updatedTicket.eventeeId,
                amountPaid: updatedTicket.amountPaid,
                reference: reference
            });

            return { status: 'JUST_PAID', ticket: updatedTicket };
        }

        return { status: 'PENDING', ticket };
    };
}