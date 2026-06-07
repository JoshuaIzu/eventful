export interface IPricingStrategy {
    calculate(basePrice: number): number;
}
