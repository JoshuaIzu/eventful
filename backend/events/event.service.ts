import { Redis } from 'ioredis';
import { IEventRepository } from './event.repository.interface';
import { IEvent, ICreateEventDTO, IUpdateEventDTO, ISocialShareResponse, PricingType } from '../types';
import { IPricingStrategy } from './strategies/pricing.strategy.interface';
import {ITicketRepository} from "./ticket.repository.interface";

export class EventService {
  private readonly popularEventsCacheKey = 'cache:events:popular';

  constructor(
    private readonly eventRepo: IEventRepository,
    private readonly ticketRepo: ITicketRepository,
    private readonly cache: Redis,
    private readonly pricingStrategies: Map<PricingType, IPricingStrategy>
  ) {}

  public createNewEvent = async (creatorId: string, dto: ICreateEventDTO): Promise<IEvent> => {
      const pricingStrategy = this.pricingStrategies.get(dto.pricingType);
      if (!pricingStrategy) {
          throw new Error(`No pricing strategy found for type: ${dto.pricingType}`);
      }

      const calculatedPrice = pricingStrategy.calculate(dto.basePrice);
      const savedEvent = await this.eventRepo.create(creatorId, dto, calculatedPrice);

      await this.cache.del(this.popularEventsCacheKey);
      return savedEvent;
  };

  public updateEvent = async ( eventId: string, creatorId: string, dto: IUpdateEventDTO): Promise<IEvent> => {
      const event = await this.eventRepo.findById(eventId);
      if (!event) throw new Error('EVENT_NOT_FOUND');
      if (event.creatorId !== creatorId) throw new Error('UNAUTHORIZED_ACCESS');

      let calculatedPrice = event.calculatedPrice;

      if(dto.basePrice !== undefined || dto.pricingType !== undefined) {
          const base = dto.basePrice ?? event.basePrice;
          const type = dto.pricingType ?? event.pricingType;
          const strategy = this.pricingStrategies.get(type);
          if (strategy) {
              calculatedPrice = strategy.calculate(base);
          }
      }

      const updatedEvent = await this.eventRepo.update(eventId, dto, calculatedPrice);
      await this.cache.del(this.popularEventsCacheKey);
      return updatedEvent;
  }

  public deleteEvent = async (eventId: string, creatorId: string): Promise<void> => {
      const event = await this.eventRepo.findById(eventId);
      if (!event) throw new Error('EVENT_NOT_FOUND');
      if (event.creatorId !== creatorId) throw new Error('UNAUTHORIZED_ACTION');

      const activeTickets = await this.ticketRepo.countPaidTicketsByEvent(eventId);
      if (activeTickets > 0) {
          throw new Error('EVENT_HAS_TICKETS');
      }

      await this.eventRepo.delete(eventId);
      await this.cache.del(this.popularEventsCacheKey);
  }

  public getActivePopularEvents = async (): Promise<IEvent[]> => {
          // Read from the cache layer first to fulfill "don't always hit the DB" requirement
          const cachedData = await this.cache.get(this.popularEventsCacheKey);
          if (cachedData) {
              return JSON.parse(cachedData);
          }

          const liveEvents = await this.eventRepo.findAll();
          // Flush to Redis with a 5-minute time-to-live parameter window
          await this.cache.set(this.popularEventsCacheKey, JSON.stringify(liveEvents), 'EX', 300);
          return liveEvents;
      };

  public getEventsByCreator = async (creatorId: string): Promise<IEvent[]> => {
          return await this.eventRepo.findByCreatorId(creatorId);
      };

  public buildShareMetadata = async (eventId: string, platform: 'twitter' | 'linkedin' | 'facebook'): Promise<ISocialShareResponse> => {
          const event = await this.eventRepo.findById(eventId);
          if (!event) throw new Error('EVENT_NOT_FOUND');

          const shareUrl = `https://eventful.io/events/${event.id}`;
          const generatedText = `Catch me live at ${event.title}! Secure your entry passing ticket here:`;

          return {platform, shareUrl, generatedText};
      };

  public getEventById = async (eventId: string): Promise<IEvent | null> => {
      return await this.eventRepo.findById(eventId);
  };
}