import { IPricingStrategy } from './pricing.strategy.interface';

const EARLY_BIRD_DISCOUNT_RATE = 0.20; // 20% discount

export class EarlyBirdPricingStrategy implements IPricingStrategy {
  public calculate(basePrice: number): number {
    return basePrice * (1 - EARLY_BIRD_DISCOUNT_RATE);
  }
}