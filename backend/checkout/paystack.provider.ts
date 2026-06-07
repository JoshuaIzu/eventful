import crypto from 'crypto';
import axios from 'axios';
import { IPaymentProvider } from './payment.provider.interface';
import { IPaystackRawInitializeResponse, IInitializePaymentResponse } from '../types';

export class PaystackProvider implements IPaymentProvider {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co/transaction/initialize';

  constructor() {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      throw new Error('SERVER_CONFIG_ERROR: PAYSTACK_SECRET_KEY is missing.');
    }
    this.secretKey = secret;
  }

  public initializePayment = async (
    email: string,
    amount: number,
    reference: string,
    metadata: Record<string, string>
  ): Promise<IInitializePaymentResponse> => {
    const amountInKobo = Math.round(amount * 100);

    const response = await axios.post<IPaystackRawInitializeResponse>(
      this.baseUrl,
      { email, amount: amountInKobo, reference, metadata, callback_url: process.env.CALLBACK_URL },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        }
      }
    );

    return {
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference
    };
  };

  public verifyWebhookSignature = (rawBody: string, signature: string): boolean => {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(rawBody)
      .digest('hex');

    // FIX: timingSafeEqual prevents timing attacks (Fix #3 — your original used ===)
    const hashBuffer = Buffer.from(hash, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');

    if (hashBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
  };

  public verifyTransaction = async (reference: string): Promise<boolean> => {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` }
        }
      );
      return response.data.data.status === 'success';
    } catch (error) {
      return false;
    }
  };
}

