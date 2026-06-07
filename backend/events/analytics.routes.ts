import {AnalyticsController} from "./analytics.controller";
import {RequestHandler, Router} from "express";


export function createAnalyticsRoutes(controller: AnalyticsController, limiter: RequestHandler, auth: RequestHandler): Router {
    const router = Router();

    router.get('/overview', limiter, auth, controller.getOverall);
    router.get('/event/:eventId', limiter, auth, controller.getSpecific);

    return router;
}
