import { IEventObserver } from './observer.interface';
import { IPaymentSuccessPayload } from '../../types';
import { IEventRepository } from '../../events/event.repository.interface';
import { INotificationDispatcher } from "./notification.dispatcher.interface.t";

export class NotificationObserver implements IEventObserver<'PAYMENT_SUCCESS'> {
    constructor(private readonly eventRepo: IEventRepository, private readonly dispatcher: INotificationDispatcher) {}

    public update = async (data: IPaymentSuccessPayload): Promise<void> => {
    const event = await this.eventRepo.findById(data.eventId);
    if(!event) return;

    await this.dispatcher.dispatchNotification(
        data.ticketId,
        data.eventeeId,
        data.eventId,
        data.reference,
        event.title
    );
    };
}