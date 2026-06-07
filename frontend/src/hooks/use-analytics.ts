"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => api.get("/analytics/overview").then(r => r.data),
  })
}

export function useEventAnalytics(eventId: string) {
  return useQuery({
    queryKey: ["analytics", "event", eventId],
    queryFn: () => api.get(`/analytics/event/${eventId}`).then(r => r.data),
    enabled: !!eventId,
  })
}
