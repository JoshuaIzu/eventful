import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis';
import { JOB_NAMES } from './job.names';

export const PASSWORD_RESET_QUEUE_NAME = 'password-reset';

export interface IPasswordResetJobPayload {
  to: string;
  resetToken: string;
}

export class PasswordResetQueue {
  private readonly queue: Queue<IPasswordResetJobPayload>;

  constructor() {
    this.queue = new Queue<IPasswordResetJobPayload>(PASSWORD_RESET_QUEUE_NAME, {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: { age: 86400, count: 1000 },
        removeOnFail: { age: 604800 },
      },
    });
  }

  public async addPasswordResetJob(payload: IPasswordResetJobPayload): Promise<void> {
    await this.queue.add(JOB_NAMES.SEND_PASSWORD_RESET, payload, {
      jobId: `password-reset:${payload.to}`,
    });
  }

  public getQueue(): Queue<IPasswordResetJobPayload> {
    return this.queue;
  }

  public async close(): Promise<void> {
    await this.queue.close();
  }
}
