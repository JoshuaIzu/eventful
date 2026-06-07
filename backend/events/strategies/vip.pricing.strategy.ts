import { IPricingStrategy } from './pricing.strategy.interface';

const VIP_PREMIUM_MULTIPLIER = 1.5; // 50% premium for VIP access

export class VipPricingStrategy implements IPricingStrategy {
  public calculate(basePrice: number): number {
    return basePrice * VIP_PREMIUM_MULTIPLIER;
  }
}


