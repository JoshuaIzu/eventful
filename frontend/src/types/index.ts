export type UserRole = 'CREATOR' | 'EVENTEE';
export type ReminderType = 'ONE_DAY' | 'ONE_WEEK';
export type PricingType = 'STANDARD' | 'EARLY_BIRD' | 'VIP';

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  creatorId: string;
  basePrice: number;
  calculatedPrice: number;
  reminderType: ReminderType;
  pricingType: PricingType;
  imageUrl?: string;
  createdAt: string;
}

export interface ITicket {
  id: string;
  eventId: string;
  eventeeId: string;
  qrCodeUrl: string | null;
  reference: string;
  isPaid: boolean;
  isScanned: boolean;
  amountPaid: number;
  createdAt: string;
}
