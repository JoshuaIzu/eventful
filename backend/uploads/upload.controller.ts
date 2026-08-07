import { Response } from 'express';
import { UploadService } from './upload.service';
import { IAuthenticatedRequest } from '../middleware/auth.middleware';

export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    public upload = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({error: 'UNAUTHORIZED', message: 'Authentication required.'});
                return;
            }
            if (req.user.role !== 'CREATOR') {
                res.status(403).json({error: 'FORBIDDEN', message: 'Only creators can upload images.'});
                return;
            }
            if (!req.file) {
                res.status(400).json({error: 'BAD_REQUEST', message: 'Image File is required.' });
                return
            }

            const imageUrl = await this.uploadService.uploadImage(req.file.buffer);
            res.status(201).json({imageUrl});
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            res.status(500).json({error: 'SERVER_ERROR', message });
        }
    }
}