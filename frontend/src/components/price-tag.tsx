import { cn } from "@/lib/utils"

interface PriceTagProps {
  price: number
  originalPrice?: number
  className?: string
}

export function PriceTag({ price, originalPrice, className }: PriceTagProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)

  const formattedOriginalPrice = originalPrice 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(originalPrice)
    : null

  return (
    <div className={cn("font-mono flex items-baseline gap-2", className)}>
      <span className="text-text-primary font-bold">{formattedPrice}</span>
      {formattedOriginalPrice && (
        <span className="text-text-muted text-xs line-through">{formattedOriginalPrice}</span>
      )}
    </div>
  )
}
