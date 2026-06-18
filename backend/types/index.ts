export type UserRole = 'CREATOR' | 'EVENTEE';
export type ReminderType = 'ONE_DAY' | 'ONE_WEEK';
export type PricingType = 'STANDARD' | 'EARLY_BIRD' | 'VIP';

export interface IUser {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
}

export interface IEvent {
    id: string;
    title: string;
    description: string;
    date: Date;
    creatorId: string;
    basePrice: number;
    calculatedPrice: number;
    reminderType: ReminderType;
    pricingType: PricingType;
    createdAt: Date;
}

export interface ITicket {
    id: string;
    eventId: string;
    eventeeId: string;
    qrCodeUrl: string | null;
    isPaid: boolean;
    isScanned: boolean;
    amountPaid: number;
    reference?: string | null;
    createdAt: Date;
}

export interface IAuthResponse {
    user: Omit<IUser, 'passwordHash'>;
    token: string;
}

export interface ILoginDTO {
    email: string;
    password: string;
}

export interface ISignupDTO {
    email: string;
    password: string;
    role: UserRole;
}



export interface ICreateEventDTO {
    title: string;
    description: string;
    date: Date | string;
    basePrice: number;
    reminderType: ReminderType;
    pricingType: PricingType;
}

export interface IUpdateEventDTO{
    title?: string;
    description?: string;
    date?: Date | string;
    basePrice?: number;
    reminderType?: ReminderType;
    pricingType?: PricingType;
}

export interface IOverallAnalytics {
    totalEvents: number;
    totalAttendeesCount: number;
}

export interface ISpecificEventAnalytics {
    eventId: string;
    ticketsSold: number;
    qrScannedCount: number;
}

export interface IJwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    jti: string;
}

export interface ICreateUserParams {
    email: string;
    passwordHash: string;
    role: UserRole;
}

export type AppEvent = 'PAYMENT_SUCCESS' | 'TICKET_SCANNED';

export interface IPaymentSuccessPayload {
    ticketId: string;
    eventeeId: string;
    eventId: string;
    amountPaid: number;
    reference: string;
}

export interface ITicketScannedPayload {
    ticketId: string;
    eventId: string;
    scannedAt: Date;
}

export type EventPayloadMap = {
    'PAYMENT_SUCCESS': IPaymentSuccessPayload;
    'TICKET_SCANNED': ITicketScannedPayload;
};

export interface ISocialShareResponse {
  platform: 'twitter' | 'linkedin' | 'facebook';
  shareUrl: string;
  generatedText: string;
}

export interface IInitializePaymentResponse {
    authorizationUrl: string;
    reference: string;
}


export interface IPaystackRawInitializeResponse {
    status: boolean; message: string;
    data: { authorization_url: string;
        access_code: string;
        reference: string; }; }

export interface IRateLimiterConfig {
    windowSeconds: number;
    maxRequests: number;
}

