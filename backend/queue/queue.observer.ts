import { Queue } from 'bullmq';

export interface IQueueObserverOptions {
  intervalMs?: number;
  logPrefix?: string;
}

export class QueueObserver {
  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly queues: Map<string, Queue>,
    private readonly options: IQueueObserverOptions = {}
  ) {}

  public async logQueueStatus(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      console.warn(`[queue-observer] Queue not found: ${queueName}`);
      return;
    }

    const counts = await queue.getJobCounts();
    const prefix = this.options.logPrefix || '[queue-observer]';

    console.log(`${prefix} ${queueName} - waiting: ${counts.waiting}, active: ${counts.active}, delayed: ${counts.delayed}, failed: ${counts.failed}, completed: ${counts.completed}`);
  }

  public async logAllQueues(): Promise<void> {
    for (const [name] of this.queues) {
      await this.logQueueStatus(name);
    }
  }

  public startPolling(): void {
    const interval = this.options.intervalMs ?? 60000;
    if (interval <= 0) return;

    this.intervalId = setInterval(async () => {
      await this.logAllQueues();
    }, interval);

    console.log(`${this.options.logPrefix || '[queue-observer]'} polling every ${interval}ms`);
  }

  public stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
