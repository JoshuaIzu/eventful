import 'dotenv/config'
import { StandardPricingStrategy } from './events/strategies/standard.pricing.strategy';
import { EarlyBirdPricingStrategy } from './events/strategies/earlybird.pricing.strategy';
import { VipPricingStrategy } from './events/strategies/vip.pricing.strategy';
import { IPricingStrategy } from './events/strategies/pricing.strategy.interface';
import { PricingType } from './types';
import { redis, redisConfig } from './config/redis';
import { AtomicRedisRateLimiter } from './middleware/rate-limiter.middleware';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { EventService } from "./events/event.service";
import express from 'express';
import { EventRepository } from "./events/event.repository";
import { AuthController } from "./auth/auth.controller";
import { UserRepository } from "./auth/user.repository";
import { AuthService } from "./auth/auth.service";
import { createAuthRoutes } from './auth/auth.routes';
import { EventController } from "./events/event.controller";
import { createEventRoutes } from "./events/event.routes";
import { createAuthMiddleWare } from "./middleware/auth.middleware";
import { TicketRepository } from "./events/ticket.repository";
import { AnalyticsService } from "./events/analytics.service";
import { AnalyticsController } from "./events/analytics.controller";
import { createAnalyticsRoutes } from "./events/analytics.routes";
import { Worker } from 'bullmq';
import { PaystackProvider } from './checkout/paystack.provider';
import { CheckoutService } from './checkout/checkout.service';
import { CheckoutController } from './checkout/checkout.controller';
import { WebhookController } from './checkout/webhook.controller';
import { EventSubject } from './core/event.subject';
import { TicketQrObserver } from './checkout/observer/ticket.qr.observer';
import { NotificationObserver } from './checkout/observer/notification.observer';
import { BullMQNotificationDispatcher } from './checkout/observer/bullmq.notification.dispatcher';
import { createCheckoutRoutes } from './checkout/checkout.routes';
import {createSendReceiptProcessor} from "./queue/processors/send.receipt.processor";
import { JOB_NAMES } from './queue/job.names';
import { ResendEmailService } from './queue/services/email.service';
import { NOTIFICATION_QUEUE_NAME, createNotificationQueue } from './queue/notification-queue';
import { createSendReminderProcessor } from "./queue/processors/send.reminder.processor";
import { ReminderQueue, REMINDER_QUEUE_NAME } from './queue/reminder-queue';
import { QueueObserver } from './queue/queue.observer';
import { ReminderObserver } from './checkout/observer/reminder.observer';
import { OneDayReminderStrategy } from './events/strategies/oneday.reminder.strategy';
import { OneWeekReminderStrategy } from './events/strategies/oneweek.reminder.strategy';
import { IReminderStrategy } from './events/strategies/reminder.strategy.interface.';
import { ReminderType } from './types';
import { scanAuthMiddleware } from './middleware/scan.auth.middleware';
import { ScanController } from './events/scan.controller';
import { createScanRoutes } from './events/scan.routes';
import path from 'path';
import next from 'next';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const app = express();

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL!),
})

const reminderStrategies = new Map<ReminderType, IReminderStrategy>([
    ['ONE_DAY', new OneDayReminderStrategy()],
    ['ONE_WEEK', new OneWeekReminderStrategy()],
]);

const pricingStrategies = new Map<PricingType, IPricingStrategy>([
  ['STANDARD', new StandardPricingStrategy()],
  ['EARLY_BIRD', new EarlyBirdPricingStrategy()],
  ['VIP', new VipPricingStrategy()],
]);



app.set('trust proxy', 1);

const emailService = new ResendEmailService();
const handleSendReceipt = createSendReceiptProcessor(emailService);

const worker = new Worker(
    NOTIFICATION_QUEUE_NAME,
    async (job) => {
        switch (job.name) {
            case JOB_NAMES.SEND_RECEIPT:
                return handleSendReceipt(job);
            default:
                throw new Error(`Unknown job name: ${job.name}`);
        }
    },
    { connection: redisConfig, concurrency: Number(process.env.WORKER_CONCURRENCY) || 5 }
);

worker.on('completed', (job) => console.log(`[worker] ${job?.name ?? 'unknown'}#${job?.id ?? '?'} completed`));
worker.on('failed',    (job, err) => console.error(`[worker] ${job?.name ?? 'unknown'}#${job?.id ?? '?'} failed:`, err));
console.log(`[worker] listening on "${NOTIFICATION_QUEUE_NAME}" (concurrency=${Number(process.env.WORKER_CONCURRENCY) || 5})`);

const reminderQueue = new ReminderQueue();
const handleSendReminder = createSendReminderProcessor(emailService);

const reminderWorker = new Worker(
    REMINDER_QUEUE_NAME,
    async (job) => {
        switch (job.name) {
            case JOB_NAMES.SEND_REMINDER:
                return handleSendReminder(job);
            default:
                throw new Error(`Unknown job name: ${job.name}`);
        }
    },
    { connection: redisConfig, concurrency: Number(process.env.WORKER_CONCURRENCY) || 5 }
);

reminderWorker.on('completed', (job) => console.log(`[reminder-worker] ${job?.name ?? 'unknown'}#${job?.id ?? '?'} completed`));
reminderWorker.on('failed',    (job, err) => console.error(`[reminder-worker] ${job?.name ?? 'unknown'}#${job?.id ?? '?'} failed:`, err));
console.log(`[reminder-worker] listening on "${REMINDER_QUEUE_NAME}" (concurrency=${Number(process.env.WORKER_CONCURRENCY) || 5})`);


app.use(express.json());
const apiRateLimiter = new AtomicRedisRateLimiter(redis);
const strictAuthLimiter = apiRateLimiter.createMiddleware({ windowSeconds: 60, maxRequests: 5 }, 'auth');
const standardRouteLimiter = apiRateLimiter.createMiddleware({ windowSeconds: 60, maxRequests: 60 }, 'general-api');
//Repos
const userRepo = new UserRepository(prisma);
const eventRepo = new EventRepository(prisma);
const ticketRepo = new TicketRepository(prisma);

const paymentProvider    = new PaystackProvider();
const eventSubject       = new EventSubject();

//Service
const authService = new AuthService(userRepo, redis);
const authenticateToken = createAuthMiddleWare(authService);
const eventService = new EventService(eventRepo, ticketRepo, redis, pricingStrategies);
const analyticsService = new AnalyticsService(ticketRepo, redis);
const checkoutService    = new CheckoutService(eventRepo, ticketRepo, paymentProvider, eventSubject);

//Depends
const authController = new AuthController(authService);
const eventController = new EventController(eventService);
const analyticController = new AnalyticsController(analyticsService);
const checkoutController = new CheckoutController(checkoutService);
const webhookController  = new WebhookController(paymentProvider, ticketRepo, eventSubject);
const scanController = new ScanController(ticketRepo);

// Observers
const notificationQueue     = createNotificationQueue();
const notificationDispatcher = new BullMQNotificationDispatcher(notificationQueue, userRepo);

eventSubject.attach('PAYMENT_SUCCESS', new TicketQrObserver(ticketRepo));
eventSubject.attach('PAYMENT_SUCCESS', new NotificationObserver(eventRepo, notificationDispatcher));
eventSubject.attach('PAYMENT_SUCCESS', new ReminderObserver(eventRepo, userRepo, reminderQueue, reminderStrategies));

// Queue Observer - monitors queue status and logs to console
const queueObserver = new QueueObserver(
  new Map([
    [NOTIFICATION_QUEUE_NAME, notificationQueue],
    [REMINDER_QUEUE_NAME, reminderQueue.getQueue()],
  ]),
  {
    intervalMs: Number(process.env.QUEUE_OBSERVER_INTERVAL_MS) || 30000,
    logPrefix: '[queue-monitor]',
  }
);

queueObserver.startPolling();

const dev = process.env.NODE_ENV !== 'production';
const frontendDir = path.join(__dirname, dev ? '../frontend' : '../../frontend');
const nextApp = next({ dev, dir: frontendDir });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  app.use('/api/auth',      createAuthRoutes(authController, strictAuthLimiter, authenticateToken));
  app.use('/api/events',    createEventRoutes(eventController, standardRouteLimiter, authenticateToken));
  app.use('/api/analytics', createAnalyticsRoutes(analyticController, standardRouteLimiter,authenticateToken));
  app.use('/api/checkout',   createCheckoutRoutes(checkoutController, webhookController, standardRouteLimiter, authenticateToken));
  app.use('/api/scan',       createScanRoutes(scanController, standardRouteLimiter, scanAuthMiddleware));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


  app.use(express.static(path.join(frontendDir, 'public')));


  app.use('/_next', express.static(path.join(frontendDir, '.next')));


  app.all('*', (req, res) => {
    return handle(req, res);
  });

  const shutdown = async (signal: string) => {
    console.log(`[server] received ${signal}, shutting down…`);
    queueObserver.stopPolling();
    await worker.close();
    await reminderWorker.close();
    await notificationQueue.close();
    await reminderQueue.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server & Next.js running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Error starting Next.js Custom Server:', err);
  process.exit(1);
});