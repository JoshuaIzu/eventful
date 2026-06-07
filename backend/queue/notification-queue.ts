import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis';

export const NOTIFICATION_QUEUE_NAME = 'notifications';

export function createNotificationQueue(): Queue {
  return new Queue(NOTIFICATION_QUEUE_NAME, { connection: redisConfig });
}
