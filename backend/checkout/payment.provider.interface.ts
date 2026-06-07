import { IInitializePaymentResponse } from '../types';

export interface IPaymentProvider {
    initializePayment(
        email: string,
        amount: number,
        reference: string,
        metadata: Record<string, string>
    ): Promise<IInitializePaymentResponse>;
    verifyWebhookSignature(rawBody: string, signature: string): boolean;
    verifyTransaction(reference: string): Promise<boolean>;
}