"use client"

import { useState } from "react"
import axios from "axios"
import { useScanTicket } from "@/hooks/use-scan"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function getScanError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Scan failed"
  }
  return "Scan failed"
}

export function QRScanner({ eventId }: { eventId: string }) {
  const [password, setPassword] = useState("")
  const [ticketId, setTicketId] = useState("")
  const [saved, setSaved] = useState(() => {
    if (typeof window !== 'undefined') {
      // Prioritize explicit localStorage, fallback to env
      return !!(localStorage.getItem("eventful_scan_password") || process.env.NEXT_PUBLIC_SCAN_PASSWORD)
    }
    return false
  })

  // If we cleared it manually, saved will be false. 
  // If we reload, it will check env again.
  const scan = useScanTicket()

  const savePassword = () => {
    localStorage.setItem("eventful_scan_password", password)
    setSaved(true)
  }

  const handleScan = () => {
    scan.mutate({ ticketId, eventId })
  }

  if (!saved) {
    return (
      <div className="p-8 space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold">Enter Scan Password</h2>
        <p className="text-text-secondary text-sm">
          This password is provided by the event organizer. No login required.
        </p>
        <Input
          type="password"
          placeholder="Scan password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={savePassword} className="w-full">
          Continue
        </Button>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Scan Ticket</h2>
        <button
          onClick={() => {
            localStorage.removeItem("eventful_scan_password")
            // Ensure even if env is set, user can "Change password" by clearing local and forcing prompt
            // Actually if env is set, it will always be saved=true if we use the previous logic.
            // Let's use a dedicated state for "forced logout" or just clear it.
            setSaved(false)
          }}
          className="text-xs text-text-muted underline"
        >
          Change password
        </button>
      </div>

      <Input
        placeholder="Ticket ID (or scan QR)"
        value={ticketId}
        onChange={(e) => setTicketId(e.target.value)}
      />

      <Button
        onClick={handleScan}
        disabled={scan.isPending || !ticketId}
        className="w-full"
      >
        {scan.isPending ? "Verifying..." : "Verify Ticket"}
      </Button>

      {scan.isSuccess && (
        <div className="p-4 rounded-lg bg-success/10 border border-success text-success text-sm">
          {scan.data.message}
        </div>
      )}

      {scan.isError && (
        <div className="p-4 rounded-lg bg-error/10 border border-error text-error text-sm">
          {getScanError(scan.error)}
        </div>
      )}
    </div>
  )
}
