import { IEvent, ICreateEventDTO  } from '../types';

export interface IEventRepository {
    findById(id: string): Promise<IEvent | null>;
    findAll(): Promise<IEvent[]>;
    findByCreatorId(creatorId: string): Promise<IEvent[]>;
    create(creatorId: string, dto: ICreateEventDTO, calculatedPrice: number ): Promise<IEvent>;
}