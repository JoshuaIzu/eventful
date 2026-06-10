"use client"

import { IEvent } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { BorderBeamButton } from "@/components/ui/border-beam-button"
import { PriceTag } from "@/components/price-tag"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Calendar } from "lucide-react"

interface EventCardProps {
  event: IEvent
}

export function EventCard({ event }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative"
    >
      <Card className="overflow-hidden bg-surface border-border hover:border-accent transition-colors">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={event.imageUrl || "/images/evenful-ui-mockup.png"}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-2 py-1 rounded-md border border-border">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-primary">
              <Calendar className="w-3 h-3 text-accent" />
              {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-lg text-text-primary line-clamp-1 group-hover:text-accent transition-colors">
            {event.title}
          </h3>
          <p className="text-text-secondary text-sm line-clamp-2 min-h-[40px]">
            {event.description}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <PriceTag price={event.calculatedPrice} originalPrice={event.pricingType === 'EARLY_BIRD' ? event.basePrice : undefined} />
          <Link href={`/events/${event.id}`}>
            <BorderBeamButton 
              size="sm" 
              variant="outline" 
              variantColor="colorful"
              beamSize="sm"
            >
              Get Tickets
            </BorderBeamButton>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
