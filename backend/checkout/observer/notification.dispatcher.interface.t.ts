export interface INotificationDispatcher {
  dispatchNotification(
    ticketId: string,
    eventId: string,
    eventeeId: string,
    reference: string,
    eventName: string
  ): Promise<void>;
}