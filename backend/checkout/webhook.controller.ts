import { Request, Response } from 'express';
import { z } from 'zod';
import { IPaymentProvider } from "./payment.provider.interface";
import { ITicketRepository } from "../events/ticket.repository.interface";
import { EventSubject} from "../core/event.subject";

const PaystackWebhookSchema = z.object({
    event: z.string(),
    data: z.object({
        reference: z.string(),
        status: z.string(),
        metadata: z.object({
            ticketId: z.string(),
        }),
        amount: z.number(),
    }),
});


export class WebhookController {
    constructor(private readonly paymentProvider: IPaymentProvider, private readonly ticketRepo: ITicketRepository, private readonly eventSubject: EventSubject) {}

    public captureWebhook = async (req: Request, res: Response): Promise<void> => {
        const rawPayload = req.body.toString('utf8');
        const signature = req.headers['x-paystack-signature'];

        if(typeof signature !== 'string') {
            res.status(400).send('Missing or invalid signature');
            return;
        }
        const isValid = this.paymentProvider.verifyWebhookSignature(rawPayload, signature);
        if(!isValid) {
            res.status(400).send('Invalid signature');
            return;
        }

        const parsedBody = PaystackWebhookSchema.safeParse(JSON.parse(rawPayload));
        if (!parsedBody.success) {
            res.status(400).send('Invalid payload');
            return;
        }

        const { data } = parsedBody.data;
        const ticketId = data.metadata.ticketId;

        const ticket = await this.ticketRepo.findByTicketId(ticketId);
        if(!ticket) {
            res.status(404).send('Ticket not found');
            return;
        }
        if (!ticket.isPaid) {
         await this.ticketRepo.markAsPaid(ticket.id);
         await this.ticketRepo.updateTicketStatus(ticketId, true);

         await this.eventSubject.notify('PAYMENT_SUCCESS', {
            ticketId: ticket.id,
            eventeeId: ticket.eventeeId,
            eventId: ticket.eventId,
            amountPaid: data.amount,
            reference: data.reference,
        });

        res.status(200).send('OK');
    }
}
}