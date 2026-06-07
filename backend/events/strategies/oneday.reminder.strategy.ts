import { IReminderStrategy } from './reminder.strategy.interface.';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class OneDayReminderStrategy implements IReminderStrategy {
  public calculateDelayMs(eventDate: Date): number {
    const reminderTime = eventDate.getTime() - ONE_DAY_MS;
    return reminderTime - Date.now();
  }
}