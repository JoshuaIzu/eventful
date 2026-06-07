import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 60s before background refetch
      staleTime: 60 * 1000,
      // Cache unused data for 5 minutes before garbage collection
      gcTime: 5 * 60 * 1000,
      // Don't refetch when window regains focus (mobile-friendly)
      refetchOnWindowFocus: false,
      // Retry failed requests 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Throw errors to error boundaries instead of returning { error }
      throwOnError: false,
    },
    mutations: {
      // Retry mutations only once (payments should not loop)
      retry: 1,
    },
  },
})

// Helper: invalidate specific cache keys
export function invalidateEvents() {
  queryClient.invalidateQueries({ queryKey: ["events"] })
}

export function invalidateTickets() {
  queryClient.invalidateQueries({ queryKey: ["tickets"] })
}

export function invalidateAnalytics() {
  queryClient.invalidateQueries({ queryKey: ["analytics"] })
}
