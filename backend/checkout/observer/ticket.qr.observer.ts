import QRCode from 'qrcode';
import { IEventObserver } from './observer.interface';
import { ITicketRepository } from '../../events/ticket.repository.interface';
import { IPaymentSuccessPayload } from '../../types';

export class TicketQrObserver implements IEventObserver<'PAYMENT_SUCCESS'> {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  public update = async (data: IPaymentSuccessPayload): Promise<void> => {
    const trackingPayload = JSON.stringify({
      ticketId: data.ticketId,
      eventId: data.eventId,
      eventeeId: data.eventeeId
    });

    const base64DataUrl = await QRCode.toDataURL(trackingPayload);
    await this.ticketRepo.updateQrCode(data.ticketId, base64DataUrl);
  };
}