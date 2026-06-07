"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ITicket } from "@/types"

export function useCheckout() {
  return useMutation({
    mutationFn: ({ eventId }: { eventId: string }) =>
      api.post("/checkout", { eventId }).then(r => r.data),
  })
}

export function useTicketHistory() {
  return useQuery<ITicket[]>({
    queryKey: ["checkout", "history"],
    queryFn: () => api.get("/checkout/history").then(r => r.data),
  })
}

export function useVerifyPayment(reference: string) {
  return useQuery({
    queryKey: ["checkout", "verify", reference],
    queryFn: () => api.get(`/checkout/verify/${reference}`).then(r => r.data),
    enabled: !!reference,
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 3000 : false, // Poll every 3s while pending
  })
}
