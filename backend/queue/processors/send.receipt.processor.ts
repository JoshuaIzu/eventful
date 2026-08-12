import { Job } from 'bullmq';
import { IEmailService, ITicketReceipt } from '../services/email.service';
import { JOB_NAMES } from '../job.names';
import { ITicketRepository } from "../../events/ticket.repository.interface";

export interface ISendReceiptJobData {
    to: string;
    ticketId: string;
    eventId: string;
    reference: string;
    eventName: string;
    qrCodeUrl: string | null;
}

export const SEND_RECEIPT_JOB_NAME = JOB_NAMES.SEND_RECEIPT;

export function createSendReceiptProcessor(emailService: IEmailService, ticketRepo: ITicketRepository) {
    return async (job: Job<ISendReceiptJobData>): Promise<void> => {
        const qrCodeUrl = job.data.qrCodeUrl ??
            (await ticketRepo.findByTicketId(job.data.ticketId))?.qrCodeUrl ?? null;

        const receipt: ITicketReceipt = {
            to:  job.data.to,
            ticketId: job.data.ticketId,
            eventId: job.data.eventId,
            reference: job.data.reference,
            eventName: job.data.eventName,
            qrCodeUrl,
        };
        await emailService.sendTicketReceipt(receipt);
    };
}