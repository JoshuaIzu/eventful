export interface IReminderStrategy {
  /**
   * Calculates the delay in milliseconds before the event reminder should fire.
   *
   * @param eventDate - The date of the event
   * @returns Delay in ms. Negative values indicate the reminder time has already passed.
   */
  calculateDelayMs(eventDate: Date): number;
}