import { IReminderStrategy } from './reminder.strategy.interface.';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export class OneWeekReminderStrategy implements IReminderStrategy {
  public calculateDelayMs(eventDate: Date): number {
    const reminderTime = eventDate.getTime() - ONE_WEEK_MS;
    return reminderTime - Date.now();
  }
}