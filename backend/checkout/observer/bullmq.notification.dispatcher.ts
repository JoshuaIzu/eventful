import type { Queue } from 'bullmq';
import { INotificationDispatcher } from './notification.dispatcher.interface.t';
import { redisConfig } from '../../config/redis';
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
        await this.notificationQueue.add(JOB_NAMES.SEND_RECEIPT, payload,
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
            }
        );
    };
}