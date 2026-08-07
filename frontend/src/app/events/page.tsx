"use client"

import { cn } from "@/lib/utils"
import * as React from "react"
import { useEvents } from "@/hooks/use-events"
import { EventCard } from "@/components/event-card"
import { LoadingCarousel } from "@/components/ui/loading-carousel"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const TIPS = [
  "Early bird saves 20%",
  "Scan QR at the venue for quick entry",
  "Get reminders before the event starts",
  "Follow your favorite creators"
]

const CATEGORIES = ["All", "Music", "Tech", "Arts", "Sports", "Business"]

export default function DiscoveryPage() {
  const { data: events, isLoading, error } = useEvents()
  const [search, setSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("All")

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <DesktopSidebar />
      
      <main className="flex-1  min-w-0 flex flex-col pb-20 sm:pb-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Discover Events</h1>
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Search events..."
                className="pl-10 bg-surface border-border focus:ring-accent font-mono"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button variant="outline" size="sm" className="shrink-0 border-border">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-1.5 font-mono text-xs uppercase tracking-wider",
                  activeCategory === cat ? "bg-accent hover:bg-accent-glow" : "border-border text-text-secondary hover:text-text-primary"
                )}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-100">
              <LoadingCarousel tips={TIPS} />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-error">
                Failed to load events. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}


