import { AuthController } from "./auth.controller";
import {RequestHandler, Router} from "express";

export function createAuthRoutes(controller: AuthController, strictLimiter: RequestHandler, auth: RequestHandler ): Router {
    const router = Router();
    router.post('/signup', strictLimiter, controller.signup);
    router.post('/login', strictLimiter, controller.login);
    router.get('/me', strictLimiter, auth, controller.getMe);
    router.delete('/logout', strictLimiter, auth, controller.logout);

    router.post('/reset-password', strictLimiter, controller.requestPasswordReset);
    router.post('/confirm-reset', strictLimiter, controller.resetPassword)
    return router;
}