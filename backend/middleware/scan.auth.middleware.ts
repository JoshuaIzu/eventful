import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto';


export function scanAuthMiddleware(req: Request, res: Response, next: NextFunction):void {
    const providedPassword = req.headers['x-scan-id'];
    const expectedPassword = process.env.SCAN_PASSWORD;

    if(!expectedPassword) {
        res.status(500).json({ error: 'internal_server_error', message: 'The scan password required.'});
        return;
    }

    if (typeof providedPassword !== 'string') {
        res.status(401).json({ error: 'unauthorized', message: 'Invalid scan password.'});
    return;
    }

    const providedBuffer = Buffer.from(providedPassword);
    const expectedBuffer = Buffer.from(expectedPassword);

    if(providedBuffer.length !== expectedBuffer.length) {
        res.status(401).json({ error: 'unauthorized', message: 'Invalid scan password.'});
        return;
    }

    const isValid = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
    if(!isValid) {
        res.status(401).json({ error: 'unauthorized', message: 'Invalid scan password.'});
        return;
    }

    next();
}