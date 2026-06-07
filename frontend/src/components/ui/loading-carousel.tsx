"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingCarouselProps {
  tips: string[]
  interval?: number
}

export function LoadingCarousel({ tips, interval = 4000 }: LoadingCarouselProps) {
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % tips.length)
    }, interval)
    return () => clearInterval(timer)
  }, [tips.length, interval])

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="h-12 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-text-secondary text-sm text-center max-w-xs italic"
          >
            "{tips[current]}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
