"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface LogoCarouselProps {
  logos: { src: string; alt: string }[]
  columns?: number
}

export function LogoCarousel({ logos, columns = 1 }: LogoCarouselProps) {
  return (
    <div className="w-full overflow-hidden py-12">
      <motion.div
        className="flex gap-12"
        animate={{
          x: [0, -1035],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ width: "max-content" }}
      >
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          >
             <span className="text-2xl font-bold text-text-muted">{logo.alt}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
