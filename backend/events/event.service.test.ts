import { EventService } from './event.service';
import { IEventRepository } from './event.repository.interface';
import { ICreateEventDTO, PricingType } from '../types';
import { IPricingStrategy } from './strategies/pricing.strategy.interface';
import { StandardPricingStrategy } from './strategies/standard.pricing.strategy';
import { EarlyBirdPricingStrategy } from './strategies/earlybird.pricing.strategy';
import { VipPricingStrategy } from './strategies/vip.pricing.strategy';
import { Redis } from 'ioredis';

describe('Vertical Slice 2: Event Management & Pricing Strategies', () => {
  let eventService: EventService;
  let mockEventRepo: jest.Mocked<IEventRepository>;
  let mockCache: jest.Mocked<Redis>;
  let pricingStrategies: Map<PricingType, IPricingStrategy>;

  beforeEach(() => {
    mockEventRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByCreatorId: jest.fn(),
      create: jest.fn(),
    };
    mockCache = {
      del: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    pricingStrategies = new Map<PricingType, IPricingStrategy>([
      ['STANDARD', new StandardPricingStrategy()],
      ['EARLY_BIRD', new EarlyBirdPricingStrategy()],
      ['VIP', new VipPricingStrategy()],
    ]);

    eventService = new EventService(mockEventRepo, mockCache, pricingStrategies);
  });

  describe('Event Creation & Strategy Application', () => {
    it('should apply the Early Bird strategy (20% discount) and invalidate cache', async () => {
      const payload: ICreateEventDTO = {
        title: 'Lagos Backend Engineers Meetup',
        description: 'Deep dive into clean architecture',
        date: new Date(Date.now() + 86400000),
        basePrice: 10000,
        reminderType: 'ONE_WEEK',
        pricingType: 'EARLY_BIRD',
      };

      mockEventRepo.create.mockResolvedValue({
        id: 'evt_123',
        creatorId: 'usr_admin',
        title: payload.title,
        description: payload.description,
        date: new Date(Date.now() + 86400000),
        basePrice: payload.basePrice,
        calculatedPrice: 8000,
        reminderType: payload.reminderType,
        pricingType: payload.pricingType,
        createdAt: new Date(),
      });

      const result = await eventService.createNewEvent('usr_admin', payload);

      expect(result.calculatedPrice).toBe(8000);
      expect(mockEventRepo.create).toHaveBeenCalledWith('usr_admin', payload, 8000);
      expect(mockCache.del).toHaveBeenCalledWith('cache:events:popular');
    });

    it('should apply the Standard strategy (no discount)', async () => {
      const payload: ICreateEventDTO = {
        title: 'Standard Pricing Event',
        description: 'Regular price',
        date: new Date(Date.now() + 86400000),
        basePrice: 5000,
        reminderType: 'ONE_DAY',
        pricingType: 'STANDARD',
      };

      mockEventRepo.create.mockResolvedValue({
        id: 'evt_456',
        creatorId: 'usr_admin',
        title: payload.title,
        description: payload.description,
        date: new Date(Date.now() + 86400000),
        basePrice: payload.basePrice,
        calculatedPrice: 5000,
        reminderType: payload.reminderType,
        pricingType: payload.pricingType,
        createdAt: new Date(),
      });

      const result = await eventService.createNewEvent('usr_admin', payload);

      expect(result.calculatedPrice).toBe(5000);
      expect(mockEventRepo.create).toHaveBeenCalledWith('usr_admin', payload, 5000);
    });

    it('should apply the VIP strategy (50% premium)', async () => {
      const payload: ICreateEventDTO = {
        title: 'VIP Gala Night',
        description: 'Premium access',
        date: new Date(Date.now() + 86400000),
        basePrice: 10000,
        reminderType: 'ONE_WEEK',
        pricingType: 'VIP',
      };

      mockEventRepo.create.mockResolvedValue({
        id: 'evt_789',
        creatorId: 'usr_admin',
        title: payload.title,
        description: payload.description,
        date: new Date(Date.now() + 86400000),
        basePrice: payload.basePrice,
        calculatedPrice: 15000,
        reminderType: payload.reminderType,
        pricingType: payload.pricingType,
        createdAt: new Date(),
      });

      const result = await eventService.createNewEvent('usr_admin', payload);

      expect(result.calculatedPrice).toBe(15000);
      expect(mockEventRepo.create).toHaveBeenCalledWith('usr_admin', payload, 15000);
    });

    it('should throw for unsupported pricing type', async () => {
      const payload: ICreateEventDTO = {
        title: 'Invalid Pricing',
        description: 'Unknown pricing type',
        date: new Date(Date.now() + 86400000),
        basePrice: 1000,
        reminderType: 'ONE_DAY',
        pricingType: 'UNKNOWN' as PricingType,
      };

      await expect(eventService.createNewEvent('usr_admin', payload))
        .rejects
        .toThrow('No pricing strategy found for type: UNKNOWN');
    });
  });

  describe('getActivePopularEvents', () => {
    it('should return cached data when available', async () => {
      const cachedEvents = [
        { id: 'evt_1', title: 'Cached Event 1' },
        { id: 'evt_2', title: 'Cached Event 2' },
      ];

      mockCache.get.mockResolvedValue(JSON.stringify(cachedEvents));

      const result = await eventService.getActivePopularEvents();

      expect(result).toEqual(cachedEvents);
      expect(mockEventRepo.findAll).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache when cache is empty', async () => {
      const dbEvents = [
        {
          id: 'evt_1',
          title: 'Live Event',
          description: 'Test',
          date: new Date(),
          creatorId: 'usr_1',
          basePrice: 100,
          calculatedPrice: 100,
          reminderType: 'ONE_DAY' as const,
          pricingType: 'STANDARD' as const,
          createdAt: new Date(),
        },
      ];

      mockCache.get.mockResolvedValue(null);
      mockEventRepo.findAll.mockResolvedValue(dbEvents);

      const result = await eventService.getActivePopularEvents();

      expect(result).toEqual(dbEvents);
      expect(mockEventRepo.findAll).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith(
        'cache:events:popular',
        JSON.stringify(dbEvents),
        'EX',
        300
      );
    });
  });

  describe('getEventsByCreator', () => {
    it('should delegate to repository', async () => {
      const creatorEvents = [
        {
          id: 'evt_1',
          title: 'My Event',
          description: 'Test',
          date: new Date(),
          creatorId: 'usr_creator',
          basePrice: 500,
          calculatedPrice: 500,
          reminderType: 'ONE_DAY' as const,
          pricingType: 'STANDARD' as const,
          createdAt: new Date(),
        },
      ];

      mockEventRepo.findByCreatorId.mockResolvedValue(creatorEvents);

      const result = await eventService.getEventsByCreator('usr_creator');

      expect(result).toEqual(creatorEvents);
      expect(mockEventRepo.findByCreatorId).toHaveBeenCalledWith('usr_creator');
    });
  });

  describe('buildShareMetadata', () => {
    it('should return correct share URL and generated text', async () => {
      const event = {
        id: 'evt_share_123',
        title: 'Shareable Event',
        description: 'Test',
        date: new Date(),
        creatorId: 'usr_1',
        basePrice: 100,
        calculatedPrice: 100,
        reminderType: 'ONE_DAY' as const,
        pricingType: 'STANDARD' as const,
        createdAt: new Date(),
      };

      mockEventRepo.findById.mockResolvedValue(event);

      const result = await eventService.buildShareMetadata('evt_share_123', 'twitter');

      expect(result).toEqual({
        platform: 'twitter',
        shareUrl: 'https://eventful.io/events/evt_share_123',
        generatedText: 'Catch me live at Shareable Event! Secure your entry passing ticket here:',
      });
    });

    it('should throw EVENT_NOT_FOUND when event does not exist', async () => {
      mockEventRepo.findById.mockResolvedValue(null);

      await expect(eventService.buildShareMetadata('evt_nonexistent', 'linkedin'))
        .rejects
        .toThrow('EVENT_NOT_FOUND');
    });
  });
})