import { IEventObserver} from './observer.interface';
import { IPaymentSuccessPayload, ReminderType } from '../../types';
import { IEventRepository } from '../../events/event.repository.interface';
import { IUserRepository } from '../../auth/user-repository.interface';
import { ReminderQueue } from '../../queue/reminder-queue';
import { IReminderStrategy } from '../../events/strategies/reminder.strategy.interface.'

export class ReminderObserver implements IEventObserver<'PAYMENT_SUCCESS'> {
    constructor(
        private readonly eventRepo: IEventRepository,
        private readonly userRepo: IUserRepository,
        private readonly reminderQueue: ReminderQueue,
        private readonly strategies: Map<ReminderType, IReminderStrategy>,
    ) {}

    public update = async (data: IPaymentSuccessPayload): Promise<void> => {
        const event = await this.eventRepo.findById(data.eventId);
        if (!event) return ;

        const user = await this.userRepo.findById(data.eventeeId);
        if (!user) return;

        const strategy = this.strategies.get(event.reminderType);
        if(!strategy) {
            console.warn(`[reminder] no strategy for reminderType=${event.reminderType}`);
            return;
        }

        const delayMs = strategy.calculateDelayMs(event.date);
        if (delayMs <= 0) {
            console.log(
                `[reminder] skipping ticket=${data.ticketId} for event=${data.eventId} as it's already passed`
            );
            return;
        }

        await this.reminderQueue.scheduleReminder(
            {
                to: user.email,
                ticketId: data.ticketId,
                eventId: data.eventId,
                eventeeId: data.eventeeId,
                eventName: event.title,
                reminderType: event.reminderType,
                eventDate: event.date.toISOString(),
            },
            delayMs
        );
    };
}
