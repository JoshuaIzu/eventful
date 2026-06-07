import { IPricingStrategy } from './pricing.strategy.interface';

export class StandardPricingStrategy implements IPricingStrategy {
    public calculate(basePrice: number): number {
        return basePrice;
    }
}