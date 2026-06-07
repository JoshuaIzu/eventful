import { AppEvent, EventPayloadMap } from '../../types';


export interface IEventObserver<K extends AppEvent> {
  update(data: EventPayloadMap[K]): Promise<void>;
}