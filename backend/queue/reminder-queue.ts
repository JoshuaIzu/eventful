import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis';
import { JOB_NAMES } from './job.names';
import { ReminderType } from '../types';

export const REMINDER_QUEUE_NAME = 'event-reminders';

export interface IReminderJobPayload {
  to: string;
  ticketId: string;
  eventId: string;
  eventeeId: string;
  eventName: string;
  reminderType: ReminderType;
  eventDate: string;
}

export class ReminderQueue {
  private readonly queue: Queue<IReminderJobPayload>;

  constructor() {
    this.queue = new Queue<IReminderJobPayload>(REMINDER_QUEUE_NAME, {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: { age:86400, count: 1000 },
        removeOnFail: { age:604800 },
      },
    });
  }

  public async scheduleReminder(payload: IReminderJobPayload, delayMs: number): Promise<void> {
    await this.queue.add(JOB_NAMES.SEND_REMINDER, payload, {
      jobId: `reminder:${payload.ticketId}:${payload.reminderType}`,
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
