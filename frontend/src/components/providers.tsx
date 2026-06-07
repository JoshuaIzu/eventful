"use client"

import * as React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { AuthProvider } from "@/hooks/use-auth"

export function Providers({ children }: { children: React.ReactNode }) {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(AuthProvider, null, children)
  )
}
