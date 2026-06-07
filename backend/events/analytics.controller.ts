import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { IAuthenticatedRequest } from '../middleware/auth.middleware';

export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    public getOverall = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const metrics = await this.analyticsService.getOverallMetrics();
            res.status(200).json(metrics);
        } catch (error: unknown){
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            res.status(500).json({ error: 'SERVER_ERROR', message });
        }
    };

    public getSpecific = async (req:IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const eventId = req.params.eventId as string;
            const metrics = await this.analyticsService.getSpecificEventMetrics(eventId);
            res.status(200).json(metrics);
        } catch (error: unknown){
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            res.status(500).json({ error: 'SERVER_ERROR', message });
        }
    };
}