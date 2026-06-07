import { Response } from 'express';
import { CheckoutService } from './checkout.service';
import { IAuthenticatedRequest } from '../middleware/auth.middleware';

export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) {}

    public processPayment = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if(!req.user) {
                res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
                return;
            }
            const { eventId } = req.body;
            if (!eventId) {
                res.status(400).json({ error: 'BAD_REQUEST', message: 'Event ID is required.' });
                return;
            }

            const payload = await this.checkoutService.processCheckout(
                req.user.sub,
                req.user.email,
                eventId
            );
            res.status(200).json(payload);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An Unknow Error';
            const status = message === 'PAYMENT_FAILED' ? 402 : 500;
            res.status(status).json({ error: 'CHECKOUT_FAILED', message });
        }
    }

    public getHistory = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
                return;
            }
            const history = await this.checkoutService.getTicketHistory(req.user.sub);
            res.status(200).json(history);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            res.status(500).json({ error: 'SERVER_ERROR', message });
        }
    };

    public verifyTransaction = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
                return;
            }
            const { reference } = req.params;
            const result = await this.checkoutService.verifyPayment(reference as string, req.user.sub);
            res.status(200).json(result);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            const status = message === 'TICKET_NOT_FOUND' ? 404 : message === 'UNAUTHORIZED_ACCESS' ? 403 : 500;
            res.status(status).json({ error: 'VERIFICATION_FAILED', message });
        }
    };
}