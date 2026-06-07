import { Job } from 'bullmq';
import { IEmailService, ITicketReceipt } from '../services/email.service';
import { JOB_NAMES } from '../job.names';

export interface ISendReceiptJobData {
    to: string;
    ticketId: string;
    eventId: string;
    reference: string;
    eventName: string;
}

export const SEND_RECEIPT_JOB_NAME = JOB_NAMES.SEND_RECEIPT;

export function createSendReceiptProcessor(emailService: IEmailService) {
    return async (job: Job<ISendReceiptJobData>): Promise<void> => {
        const receipt: ITicketReceipt = {
            to:  job.data.to,
            ticketId: job.data.ticketId,
            eventId: job.data.eventId,
            reference: job.data.reference,
            eventName: job.data.eventName,
        };
        await emailService.sendTicketReceipt(receipt);
    };
}