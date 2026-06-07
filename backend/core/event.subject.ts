import { AppEvent, EventPayloadMap } from "../types";

export interface IEventObserver<K extends AppEvent> {
    update(data: EventPayloadMap[K]): Promise<void>;
}

export class EventSubject {
    private observers = new Map<AppEvent, Set<IEventObserver<AppEvent>>>();

    public attach<K extends AppEvent>(event: K, observer: IEventObserver<K>): void {
        let set = this.observers.get(event);
        if (!set) {
            set = new Set();
            this.observers.set(event, set);
        }
        set.add(observer);
}

    public detach<K extends AppEvent>(event: K, observer: IEventObserver<K>): void {
        const set = this.observers.get(event);
        if(set) {
            set.delete(observer);
        }
    }
   public async notify<K extends AppEvent>(event: K, payload: EventPayloadMap[K]): Promise<void> {
    const set = this.observers.get(event);
    if (!set) return;
    const results = await Promise.allSettled(
        Array.from(set).map(observer => observer.update(payload))
    );
    results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .forEach(r => console.error('[EventSubject] Observer failed:', r.reason));
}

}
