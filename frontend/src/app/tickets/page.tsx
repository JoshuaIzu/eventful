"use client";

import * as React from "react";
import { useTicketHistory } from "@/hooks/use-checkout";
import { useEvents } from "@/hooks/use-events";
import { TicketCard } from "@/components/ticket-card";
import { LoadingCarousel } from "@/components/ui/loading-carousel";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MyTicketsPage() {
  const { data: tickets, isLoading: ticketsLoading } = useTicketHistory();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const [search, setSearch] = React.useState("");

  const isLoading = ticketsLoading || eventsLoading;

  const filteredTickets = tickets?.filter((ticket) => {
    const event = events?.find((e) => e.id === ticket.eventId);
    return event?.title.toLowerCase().includes(search.toLowerCase());
  });

  const upcomingTickets = filteredTickets?.filter((t) => {
    const event = events?.find((e) => e.id === t.eventId);
    return event && new Date(event.date) >= new Date();
  });

  const pastTickets = filteredTickets?.filter((t) => {
    const event = events?.find((e) => e.id === t.eventId);
    return event && new Date(event.date) < new Date();
  });

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <DesktopSidebar />

      <main className="flex-1 pb-20 sm:pb-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TicketIcon className="w-6 h-6 text-accent" />
              My Tickets
            </h1>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search your tickets..."
              className="pl-10 bg-surface border-border font-mono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingCarousel
                tips={["Organizing your tickets...", "Checking for updates"]}
              />
            </div>
          ) : (
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="bg-surface border border-border p-1">
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white font-mono text-xs"
                >
                  UPCOMING
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white font-mono text-xs"
                >
                  PAST
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white font-mono text-xs"
                >
                  ALL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingTickets?.length === 0 ? (
                  <EmptyTickets message="No upcoming tickets found." />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {upcomingTickets?.map((ticket) => {
                      const event = events?.find(
                        (e) => e.id === ticket.eventId,
                      );
                      return event ? (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          event={event}
                        />
                      ) : null;
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastTickets?.length === 0 ? (
                  <EmptyTickets message="No past tickets found." />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pastTickets?.map((ticket) => {
                      const event = events?.find(
                        (e) => e.id === ticket.eventId,
                      );
                      return event ? (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          event={event}
                        />
                      ) : null;
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredTickets?.map((ticket) => {
                    const event = events?.find((e) => e.id === ticket.eventId);
                    return event ? (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        event={event}
                      />
                    ) : null;
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

function EmptyTickets({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-surface/30 rounded-2xl border border-dashed border-border">
      <TicketIcon className="w-12 h-12 text-text-muted opacity-20" />
      <p className="text-text-secondary">{message}</p>
    </div>
  );
}
