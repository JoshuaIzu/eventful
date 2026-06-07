import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis';

export interface IReminderJobPayload {
  ticketId: string;
  eventId: string;
  eventeeId: string;
  reminderType: 'ONE_DAY' | 'ONE_WEEK';
  eventDate: string;
}

export class ReminderQueue {
  private readonly queue: Queue<IReminderJobPayload>;

  constructor() {
    this.queue = new Queue<IReminderJobPayload>('event-reminders', {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    });
  }

  public async scheduleReminder(payload: IReminderJobPayload, delayMs: number): Promise<void> {
    await this.queue.add('send-reminder', payload, {
      delay: Math.max(0, delayMs),
    });
  }

  public getQueue(): Queue<IReminderJobPayload> {
    return this.queue;
  }

  public async close(): Promise<void> {
    await this.queue.close();
  }
}
