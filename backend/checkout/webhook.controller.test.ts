import { Request, Response } from 'express';
import { WebhookController } from './webhook.controller';

describe('WebhookController', () => {
    let controller: WebhookController;
    let mockPaymentProvider: any;
    let mockTicketRepo: any;
    let mockEventSubject: any;
    let req: Partial<Request> & { headers: Record<string, any> };
    let res: Partial<Response>;

    beforeEach(() => {
        mockPaymentProvider = { verifyWebhookSignature: jest.fn() };
        mockTicketRepo = { findByTicketId: jest.fn() };
        mockEventSubject = { notify: jest.fn() };
        controller = new WebhookController(mockPaymentProvider, mockTicketRepo, mockEventSubject);

        req = {
            body: Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'ref', status: 'success', metadata: { ticketId: 'ticket-1' }, amount: 5000 } })),
            headers: {} as any,
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    it('should return 400 when signature is missing', async () => {
        req.headers = {};
        await controller.captureWebhook(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Missing or invalid signature');
    });

    it('should return 400 when signature is an array', async () => {
        req.headers['x-paystack-signature'] = ['sig1', 'sig2'];
        await controller.captureWebhook(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Missing or invalid signature');
    });

    it('should return 400 when signature verification fails', async () => {
        req.headers['x-paystack-signature'] = 'invalid-sig';
        mockPaymentProvider.verifyWebhookSignature.mockReturnValue(false);
        await controller.captureWebhook(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid signature');
    });

    it('should return 400 when JSON parsing fails', async () => {
        req.headers['x-paystack-signature'] = 'valid-sig';
        mockPaymentProvider.verifyWebhookSignature.mockReturnValue(true);
        req.body = Buffer.from('not-json');
        await controller.captureWebhook(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid payload');
    });

    it('should return 400 when Zod validation fails', async () => {
        req.headers['x-paystack-signature'] = 'valid-sig';
        mockPaymentProvider.verifyWebhookSignature.mockReturnValue(true);
        req.body = Buffer.from(JSON.stringify({ invalid: 'data' }));
        await controller.captureWebhook(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid payload');
    });

    it('should proceed when everything is valid', async () => {
        req.headers['x-paystack-signature'] = 'valid-sig';
        mockPaymentProvider.verifyWebhookSignature.mockReturnValue(true);
        mockTicketRepo.findByTicketId.mockResolvedValue({
            id: 'ticket-1',
            eventeeId: 'ev-1',
            eventId: 'evt-1',
        });
        await controller.captureWebhook(req as Request, res as Response);
        expect(mockTicketRepo.findByTicketId).toHaveBeenCalledWith('ticket-1');
        expect(mockEventSubject.notify).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});