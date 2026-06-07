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
import { scanAuthMiddleware } from './middleware/scan.auth.middleware';
import { ScanController } from './events/scan.controller';
import { createScanRoutes } from './events/scan.routes';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const app = express();

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL!),
})

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
const eventService = new EventService(eventRepo, redis, pricingStrategies);
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

app.use('/api/auth',      createAuthRoutes(authController, strictAuthLimiter, authenticateToken));
app.use('/api/events',    createEventRoutes(eventController, standardRouteLimiter, authenticateToken));
app.use('/api/analytics', createAnalyticsRoutes(analyticController, standardRouteLimiter,authenticateToken));
app.use('/api/checkout',   createCheckoutRoutes(checkoutController, webhookController, standardRouteLimiter, authenticateToken));
app.use('/api/scan',       createScanRoutes(scanController, standardRouteLimiter, scanAuthMiddleware));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve Frontend (Next.js Standalone Build)
const frontendPath = path.join(__dirname, '../frontend/.next/standalone/frontend');
const publicPath = path.join(__dirname, '../frontend/public');
const staticPath = path.join(__dirname, '../frontend/.next/static');

if (process.env.NODE_ENV === 'production') {
  app.use('/_next/static', express.static(staticPath));
  app.use(express.static(publicPath));

  app.all('*', (req, res) => {
    // In standalone mode, we normally start the Next.js server.
    // However, if we want Express to serve the Next.js app, we can serve the static index or proxy.
    // For a smoother experience, we'll serve the static files and redirect to the Next.js server if needed,
    // but here we'll assume we want the built static files to be served by Express if possible,
    // or just inform the user they can also run them as separate processes.
    // Since Next.js 15 standalone is a bit complex to 'require', we'll use a simpler static serving if it was a static export,
    // but for standalone, it's better to let the Procfile handle it or use a proxy.
    // Given the request "starts the frontend together", the most robust way is to serve the public/index.html if it exists.
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
       if (err) {
         res.status(404).send("Frontend build not found or not accessible via Express.");
       }
    });
  });
}

const shutdown = async (signal: string) => {
    console.log(`[server] received ${signal}, shutting down…`);
    await worker.close();
    await notificationQueue.close();
    await prisma.$disconnect();
    process.exit(0);
};
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));