import { useMutation } from "@tanstack/react-query"
import { scanApi } from "@/lib/api"
import { queryClient } from "@/lib/query-client"

export function useScanTicket() {
  return useMutation({
    mutationFn: ({ ticketId, eventId }: { ticketId: string; eventId: string }) =>
      scanApi.post("/scan", { ticketId, eventId }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout", "history"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}