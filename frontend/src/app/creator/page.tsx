"use client"

import * as React from "react"
import { useAnalyticsOverview } from "@/hooks/use-analytics"
import { useMyEvents } from "@/hooks/use-events"
import { CreatorAnalyticsCard } from "@/components/analytics-card"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { LoadingCarousel } from "@/components/ui/loading-carousel"
import { BorderBeamButton } from "@/components/ui/border-beam-button"
import { Plus, Edit2, Copy, Trash2, LayoutDashboard } from "lucide-react"
import { CreateEventModal } from "@/components/create-event-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CreatorDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAnalyticsOverview()
  const [isCreateOpen, setCreateOpen] = React.useState(false)
  const { data: events, isLoading: eventsLoading } = useMyEvents()

  const isLoading = statsLoading || eventsLoading

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <DesktopSidebar />
      
      <main className="flex-1 pb-20 sm:pb-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border p-4 sm:p-6 flex items-center justify-between">
           <h1 className="text-2xl font-bold flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-accent" />
                Creator Dashboard
            </h1>
            <BorderBeamButton variantColor="sunset" size="sm" className="hidden sm:flex" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Event
            </BorderBeamButton>
        </header>

        <div className="p-4 sm:p-6 space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingCarousel tips={["Fetching your stats...", "Preparing your dashboard"]} />
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <CreatorAnalyticsCard 
                    title="Total Events" 
                    value={stats?.totalEvents || 0} 
                    icon="events" 
                />
                <CreatorAnalyticsCard 
                    title="Total Attendees" 
                    value={stats?.totalAttendeesCount || 0} 
                    icon="tickets" 
                />
                <CreatorAnalyticsCard 
                    title="Revenue" 
                    value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} 
                    icon="revenue" 
                    description="+12% from last month"
                />
                <CreatorAnalyticsCard 
                    title="Scan Rate" 
                    value={`${stats?.scanRate || 0}%`} 
                    icon="rate" 
                    description="Avg across all events"
                />
              </div>

              {/* Event List */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Your Events</h2>
                <div className="grid grid-cols-1 gap-4">
                    {events?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-surface/30 rounded-2xl border border-dashed border-border text-center space-y-4">
                             <Plus className="w-12 h-12 text-text-muted opacity-20" />
                             <p className="text-text-secondary">You haven't created any events yet.</p>
                             <BorderBeamButton variantColor="sunset" onClick={() => setCreateOpen(true)}>Create My First Event</BorderBeamButton>
                        </div>
                    ) : (
                        events?.map((event) => (
                            <Card key={event.id} className="bg-surface border-border hover:border-accent/50 transition-colors">
                                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                                            <Badge variant="outline" className="text-[10px] border-accent text-accent font-mono">
                                                {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-text-primary">{event.title}</h3>
                                            <p className="text-xs text-text-muted font-mono uppercase tracking-widest">{event.pricingType}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary">
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-error hover:bg-error/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <BorderBeamButton variantColor="mono" size="sm" className="ml-2 font-mono text-[10px]">
                                            ANALYTICS
                                        </BorderBeamButton>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
              </div>
            </>
          )}
        </div>

        <BorderBeamButton 
            variantColor="sunset" 
            size="icon" 
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full sm:hidden z-50 shadow-2xl"
            onClick={() => setCreateOpen(true)}
        >
            <Plus className="w-6 h-6" />
        </BorderBeamButton>
      </main>
      <CreateEventModal open={isCreateOpen} onOpenChange={setCreateOpen} />
      <MobileNav />
    </div>
  )
}
