import { Job } from 'bullmq';
import { IEmailService } from '../services/email.service';
import { IReminderJobPayload } from '../reminder-queue';

export function createSendReminderProcessor(emailService: IEmailService) {
  return async (job: Job<IReminderJobPayload>): Promise<void> => {
    const { to, ticketId, eventId, eventName, eventDate, reminderType } = job.data;
    await emailService.sendEventReminder({ to, ticketId, eventId, eventName, eventDate, reminderType });
  };
}