import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ISignupDTO, ILoginDTO, UserRole } from "../types";
import {IAuthenticatedRequest} from "../middleware/auth.middleware";

const VALID_ROLES: ReadonlySet<string> = new Set(['CREATOR', 'EVENTEE']);

export class AuthController {
    constructor(private authService: AuthService) {}

    public signup = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, role } = req.body;

            if (!email || !password || !role) {
                res.status(400).json({
                    error: 'bad_request',
                    message: 'Missing email password or role',
                });
                return;
            }
            const cleanEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                res.status(400).json({
                    error: 'bad_request',
                    message: 'Invalid email format',
                    }
                );
                return;
            }

            if (password.length < 8) {
                res.status(400).json({
                    error: 'BAD_REQUEST',
                    message: 'Password must be at least 8 characters '
                });
                return;
            }

            const normalizedRole = role.toUpperCase() as UserRole;
            if(!VALID_ROLES.has(normalizedRole)) {
                res.status(400).json({
                    error: 'BAD_REQUEST',
                    message: "Role must be 'CREATOR' or 'EVENTEE'.",
                });
                return;
            }


                const dto: ISignupDTO = { email, password, role: normalizedRole };
                const result = await this.authService.register(dto);
                res.status(201).json(result);
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'User with email already exists') {
                res.status(409).json({
                    error: 'conflict',
                    message: 'This email is already registered',
                });
                return;
            }
            res.status(500).json({
                error: 'Internal_Server_Error',
                message: 'An unexpected error occurred.',
            });
        }
        };
    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if(!email || !password) {
                res.status(400).json({
                    error: 'Bad_Request',
                    message: 'Missing email or password.',
                });
                return;
            }
            const dto: ILoginDTO = { email, password };
            const result = await this.authService.authenticate(dto);
            res.status(200).json(result);
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'Invalid_Credentials') {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid email or Password.',
                });
                return;
            }
            res.status(500).json({
                error: 'Internal_Server_Error',
                message: 'An unexpected error occurred.',
            });
        }

    }

    public logout = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

            if(!token || !req.user?.jti) {
                res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid Token.' })
                return;
            }

            const payload = req.user;
            const exp = (payload as any).exp as number;
            const remainingSeconds = exp - Math.floor(Date.now() / 1000);

            if (remainingSeconds > 0){
                await this.authService.blacklistToken(req.user.jti, remainingSeconds);
            }
            res.status(200).json({ message: 'Logged out successfully.' });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            res.status(500).json({ error: 'SERVER_ERROR', message });
        }
    }

    public getMe = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'UNAUTHORIZED' });
                return;
            }

            res.status(200).json({
                user: {
                    id: req.user.sub,
                    email: req.user.email,
                    role: req.user.role
                }
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            res.status(500).json({ error: 'SERVER_ERROR', message });
        }
    };
}