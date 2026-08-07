import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {  IJwtPayload } from '../types';
import { AuthService } from "../auth/auth.service";

export interface IAuthenticatedRequest extends Request {
    user?: IJwtPayload;
    file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    };
}

export function createAuthMiddleWare(authService: AuthService) {
    return async function authenticateToken(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if(!token) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication token is required'
        });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Server misconfiguration.',
        });
        return;
      }

    try {
        const payload = jwt.verify(token, secret) as IJwtPayload;
        const blacklisted = await authService.isBlackListed(payload.jti);
        if (blacklisted) {
            res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Token has been revoked.',
            });
            return;
        }

        (req as IAuthenticatedRequest).user = payload;
        next();
    } catch {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Invalid or expired token.',
    });
    }
};
}