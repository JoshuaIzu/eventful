import {RequestHandler, Router} from 'express';
import multer, { FileFilterCallback } from 'multer';
import { UploadController } from './upload.controller';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req: any, file: any, cb: FileFilterCallback) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('ONLY_IMAGES_ALLOWED'));
    },
});

export function createUploadRoutes(
    controller: UploadController,
    limiter: RequestHandler,
    auth: RequestHandler
): Router {
    const router = Router();
    router.post('/', limiter, auth, upload.single('image'), controller.upload);
    return router;
}