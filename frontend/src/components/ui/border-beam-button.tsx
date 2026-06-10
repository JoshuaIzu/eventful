"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BorderBeamButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  beamSize?: "sm" | "md" | "lg"
  variantColor?: "colorful" | "ocean" | "sunset" | "mono"
  active?: boolean
}

const BorderBeamButton = React.forwardRef<HTMLButtonElement, BorderBeamButtonProps>(
  ({ className, variant, size, asChild = false, beamSize = "md", variantColor = "colorful", active = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const beamColors = {
      colorful: "from-accent via-accent-glow to-creator",
      ocean: "from-eventee via-accent to-accent-glow",
      sunset: "from-creator via-warning to-accent",
      mono: "from-text-muted via-border to-text-secondary"
    }

    const beamStyles = {
        sm: "p-[1px]",
        md: "p-[2px]",
        lg: "p-[3px]"
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          active && "ring-2 ring-accent-glow",
          beamStyles[beamSize]
        )}
        ref={ref}
        {...props}
      >
        <motion.div
          className={cn(
            "absolute inset-0 bg-linear-to-r opacity-50",
            beamColors[variantColor]
          )}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
              width: '200%',
              height: '200%',
              top: '-50%',
              left: '-50%',
              zIndex: -1
          }}
        />
        <span className="relative z-10 bg-background w-full py-2.5 flex items-center justify-center rounded-[calc(var(--radius-md)-1px)]">
            {children}
        </span>
      </Comp>
    )
  }
)
BorderBeamButton.displayName = "BorderBeamButton"

export { BorderBeamButton }
