import { Router, RequestHandler, raw } from 'express';
import { CheckoutController } from './checkout.controller';
import { WebhookController } from './webhook.controller';

export function createCheckoutRoutes(
    checkoutController: CheckoutController,
    webhookController: WebhookController,
    limiter: RequestHandler,
    auth: RequestHandler
): Router {
    const router = Router();

    router.post('/', limiter, auth, checkoutController.processPayment);
    router.get('/history', limiter, auth, checkoutController.getHistory);
    router.get('/verify/:reference', limiter, auth, checkoutController.verifyTransaction);

    // Webhook: signature-verified, needs raw body for HMAC — no auth, no JSON parsing
    router.post(
        '/webhook',
        raw({ type: 'application/json' }),
        webhookController.captureWebhook
    );

    return router;
}