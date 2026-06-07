import { RequestHandler, Router } from 'express';
import { ScanController } from './scan.controller';

export function createScanRoutes(
    controller: ScanController,
    limiter: RequestHandler,
    auth: RequestHandler
): Router {
    const router = Router();

    router.post('/', limiter, auth, controller.verifyTicket);

    return router;
}