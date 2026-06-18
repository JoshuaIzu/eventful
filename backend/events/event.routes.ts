import { EventController } from "./event.controller";
import { RequestHandler, Router } from "express";



export function createEventRoutes(controller: EventController, limiter: RequestHandler, auth: RequestHandler): Router {
    const router = Router();
    router.post('/', limiter, auth, controller.create);
    router.get('/popular', limiter, auth, controller.listPopular);
     router.get('/my-events', limiter, auth, controller.getMyEvents);
    router.get('/:eventId/share', limiter, auth, controller.getShareLinks);
    router.get('/:eventId', limiter, auth, controller.getEventById);
    router.patch('/:eventId', limiter, auth, controller.update);
    router.delete('/:eventId', limiter, auth, controller.delete);

    return router;
}