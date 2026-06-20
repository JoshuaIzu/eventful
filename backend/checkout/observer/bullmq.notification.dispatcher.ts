import type { Queue } from 'bullmq';
import { INotificationDispatcher } from './notification.dispatcher.interface.t';
import { IUserRepository } from '../../auth/user-repository.interface';
import { JOB_NAMES } from '../../queue/job.names';
import {ISendReceiptJobData} from "../../queue/processors/send.receipt.processor";

export class BullMQNotificationDispatcher implements INotificationDispatcher {
    constructor(private readonly notificationQueue: Queue, private readonly userRepo: IUserRepository) {}

    public dispatchNotification = async (
        ticketId: string,
        eventeeId: string,
        eventId: string,
        reference: string,
        eventName: string
    ): Promise<void> => {
        const user = await this.userRepo.findById(eventeeId);
        if (!user) {
            throw new Error(`USER_NOT_FOUND: ${eventeeId}`);
        }

        const payload: ISendReceiptJobData = {
            to: user.email,
            ticketId,
            eventId,
            reference,
            eventName,
        };

        let lastError: unknown;
        for (let attempt = 1; attempt <= 3; attempt++) {
           try {
               await this.notificationQueue.add(JOB_NAMES.SEND_RECEIPT, payload,
                {   jobId: `receipt:${ticketId}`,
                    attempts: 3,
                    backoff: {type: 'exponential', delay: 1000},
                });
               return;
        }  catch (err) {
               console.error(`[notification] enqueue failed (attempt ${attempt}) ticket=${ticketId}:`, err);
               lastError = err;
           }

       }
        throw lastError;
    };
}