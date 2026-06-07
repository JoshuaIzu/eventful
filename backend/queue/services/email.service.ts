import { Resend } from 'resend';

export interface ITicketReceipt {
  to: string;
  ticketId: string;
  eventId: string;
  reference: string;
  eventName: string;
}

export interface IEmailService {
  sendTicketReceipt(receipt: ITicketReceipt): Promise<void>;
}

export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(apiKey?: string) {
    this.resend = new Resend(apiKey || process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@eventful.com';
  }

  async sendTicketReceipt(receipt: ITicketReceipt): Promise<void> {
    const { to, ticketId, eventId, reference, eventName } = receipt;

    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: `Your ticket for ${eventName}`,
      html: `
        <h1>Ticket Receipt</h1>
        <p>Thank you for your purchase!</p>
        <ul>
          <li><strong>Event:</strong> ${eventName}</li>
          <li><strong>Ticket ID:</strong> ${ticketId}</li>
          <li><strong>Event ID:</strong> ${eventId}</li>
          <li><strong>Reference:</strong> ${reference}</li>
        </ul>
      `,
    });
  }
}
