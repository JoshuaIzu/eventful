import { Resend } from 'resend';
import { ReminderType } from '../../types';

export interface ITicketReceipt {
  to: string;
  ticketId: string;
  eventId: string;
  reference: string;
  eventName: string;
}

export interface IEventReminder {
  to: string;
  ticketId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  reminderType: ReminderType;
}


export interface IEmailService {
  sendTicketReceipt(receipt: ITicketReceipt): Promise<void>;
  sendEventReminder(reminder: IEventReminder): Promise<void>;
}


const WHEN_LABEL: Record<ReminderType, string> = {
    ONE_DAY: 'tomorrow',
    ONE_WEEK: 'in one week',
};

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(apiKey?: string) {
    this.resend = new Resend(apiKey || process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_FROM_ADDRESS ?? 'ticketsreminder@joshuauzuegbu.tech';
  }

  async sendTicketReceipt(receipt: ITicketReceipt): Promise<void> {
    const { to, ticketId, eventId, reference, eventName } = receipt;

    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: `Your ticket for ${esc(eventName)}`,
      html: `
        <h1>Ticket Receipt</h1>
        <p>Thank you for your purchase!</p>
        <ul>
          <li><strong>Event:</strong> ${esc(eventName)}</li>
          <li><strong>Ticket ID:</strong> ${esc(ticketId)}</li>
          <li><strong>Event ID:</strong> ${esc(eventId)}</li>
          <li><strong>Reference:</strong> ${esc(reference)}</li>
        </ul>
      `,
    },
        { idempotencyKey: `receipt:${ticketId}` },
    );
  }


  async sendEventReminder(reminder: IEventReminder): Promise<void> {
    const { to, ticketId, eventId, eventName, eventDate, reminderType } = reminder;
    const when = WHEN_LABEL[reminderType];
    const readableDate = new Date(eventDate).toLocaleString();

    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: `Reminder: ${esc(eventName)} is ${when}`,
      html: `
        <h1>Event Reminder</h1>
        <p><strong>${esc(eventName)}</strong> is happening ${when}.</p>
        <ul>
          <li><strong>Event:</strong> ${esc(eventName)}</li>
          <li><strong>When:</strong> ${esc(readableDate)}</li>
          <li><strong>Ticket ID:</strong> ${esc(ticketId)}</li>
          <li><strong>Event ID:</strong> ${esc(eventId)}</li>
        </ul>
        <p>See you there!</p>
        `,
    },
        { idempotencyKey: `reminder:${ticketId}:${reminderType}` },
        );
  }
}
