import { Response } from 'express';
import { EventService } from './event.service';
import { IAuthenticatedRequest } from '../middleware/auth.middleware';

export class EventController {
  constructor(
    private readonly eventService: EventService
  ) {}

  public create = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
        return;
      }

      const { title, description, date, basePrice, reminderType, pricingType } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Title is required.' });
        return;
      }

      if (!date || isNaN(Date.parse(date))) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Valid date is required.' });
        return;
      }

      if (typeof basePrice !== 'number' || basePrice < 0) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Base price must be a non-negative number.' });
        return;
      }

      if (!['ONE_DAY', 'ONE_WEEK'].includes(reminderType)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Reminder type must be ONE_DAY or ONE_WEEK.' });
        return;
      }

      if (!['STANDARD', 'EARLY_BIRD', 'VIP'].includes(pricingType)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Pricing type must be STANDARD, EARLY_BIRD, or VIP.' });
        return;
      }

      const event = await this.eventService.createNewEvent(req.user.sub, {
        title, description, date, basePrice, reminderType, pricingType
      });

      res.status(201).json(event);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ error: 'SERVER_ERROR', message });
    }
  };

  public listPopular = async (_req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const events = await this.eventService.getActivePopularEvents();
      res.status(200).json(events);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ error: 'SERVER_ERROR', message });
    }
  };

  public getShareLinks = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const platform = req.query.platform as 'twitter' | 'linkedin' | 'facebook';

      if (!eventId || !platform) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing query routing targets.' });
        return;
      }

      const shareData = await this.eventService.buildShareMetadata(eventId, platform);
      res.status(200).json(shareData);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'EVENT_NOT_FOUND') {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found.' });
        return;
      }
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ error: 'SERVER_ERROR', message });
    }
  };

  public getMyEvents = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
        return;
      }
      const events = await this.eventService.getEventsByCreator(req.user.sub); // Assuming req.user.id holds the sub
      res.status(200).json(events);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ error: 'SERVER_ERROR', message });
    }
  };

  public getEventById = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const event = await this.eventService.getEventById(eventId);

      if (!event) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found.' });
        return;
      }
      res.status(200).json(event);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ error: 'SERVER_ERROR', message });
    }
  };
}
