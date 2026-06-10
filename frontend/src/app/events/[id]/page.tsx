"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEvent } from "@/hooks/use-events"
import { LoadingCarousel } from "@/components/ui/loading-carousel"
import { BorderBeamButton } from "@/components/ui/border-beam-button"
import { PriceTag } from "@/components/price-tag"
import { RoleBadge } from "@/components/role-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Share2, ArrowLeft, Clock, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: event, isLoading } = useEvent(id as string)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingCarousel tips={["Fetching event details...", "Checking seat availability"]} />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background gap-4">
        <h2 className="text-2xl font-bold">Event not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto lg:flex lg:gap-12 lg:p-12">
        {/* Left Column: Image & Main Info */}
        <div className="lg:flex-1 space-y-8">
          <div className="relative aspect-video w-full lg:rounded-2xl overflow-hidden border border-border">
            <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-4 left-4 z-10 bg-background/50 backdrop-blur-md border-border rounded-full hover:bg-background"
                onClick={() => router.back()}
            >
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <Image
              src={event.imageUrl || "/images/eventful-ui-mockup.png"}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="px-6 lg:px-0 space-y-6">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className="border-accent text-accent font-mono text-[10px] uppercase">
                    {event.pricingType.replace('_', ' ')}
                 </Badge>
                 <Badge variant="outline" className="border-border text-text-muted font-mono text-[10px] uppercase">
                    {event.reminderType.replace('_', ' ')} REMINDER
                 </Badge>
               </div>
               <h1 className="text-3xl lg:text-5xl font-bold">{event.title}</h1>
               <div className="flex flex-wrap items-center gap-6 text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    <span className="font-mono text-sm">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="font-mono text-sm">{new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
                <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-accent/20 text-accent font-bold">EC</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Event Creator</span>
                        <RoleBadge role="CREATOR" />
                    </div>
                    <p className="text-xs text-text-muted">Verified Organizer</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">About this event</h3>
                <p className="text-text-secondary leading-relaxed">
                    {event.description || "Join us for an unforgettable experience. This event brings together top minds and enthusiasts for a day of discovery and connection."}
                </p>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & CTA */}
        <div className="lg:w-[400px] shrink-0">
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/80 backdrop-blur-lg border-t border-border lg:static lg:bg-surface lg:p-8 lg:rounded-2xl lg:border lg:shadow-xl space-y-6 z-40">
             <div className="flex lg:flex-col justify-between items-center lg:items-start gap-4">
                <div className="space-y-1">
                    <p className="text-xs text-text-muted font-mono uppercase tracking-widest">Current Price</p>
                    <PriceTag 
                        price={event.calculatedPrice} 
                        originalPrice={event.pricingType === 'EARLY_BIRD' ? event.basePrice : undefined} 
                        className="text-2xl lg:text-3xl"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="border-border lg:h-12 lg:w-12">
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <BorderBeamButton 
                        size="lg" 
                        variantColor="colorful" 
                        className="hidden lg:flex flex-1"
                        onClick={() => router.push(`/checkout/${event.id}`)}
                    >
                        Get Tickets Now
                    </BorderBeamButton>
                </div>
             </div>

             <BorderBeamButton 
                size="lg" 
                variantColor="colorful" 
                className="w-full lg:hidden"
                onClick={() => router.push(`/checkout/${event.id}`)}
             >
                Get Tickets Now
             </BorderBeamButton>

             <div className="hidden lg:block pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <ShieldCheck className="w-5 h-5 text-success" />
                    <span>Secure payment via Paystack</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <TicketIcon className="w-5 h-5 text-accent" />
                    <span>Instant digital ticket delivery</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Ticket as TicketIcon } from "lucide-react"
