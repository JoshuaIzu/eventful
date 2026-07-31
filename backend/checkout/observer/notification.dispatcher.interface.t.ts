export interface INotificationDispatcher {
  dispatchNotification(
    ticketId: string,
    eventeeId: string,
    eventId: string,
    reference: string,
    eventName: string,
    qrCodeUrl: string | null
  ): Promise<void>;
}