"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
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
  const [cameraActive, setCameraActive] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [saved, setSaved] = useState(() => {

    if (typeof window !== 'undefined') {

      return !!(localStorage.getItem("scan_password") || process.env.SCAN_PASSWORD)
    }
    return false
  })



  // If we cleared it manually, saved will be false. 
  // If we reload, it will check env again.
  const scan = useScanTicket()

  const savePassword = () => {
    localStorage.setItem("scan_password", password)
    setSaved(true)
  }

  const handleScan = () => {
    scan.mutate({ ticketId, eventId })
  }

  const startCamera = async () => {
    setCameraActive(true)
    setTimeout(async () => {
      const scanner = new Html5Qrcode("qr-reader")
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setTicketId(decodedText)
          stopCamera()
        },
        undefined
      )
    }, 100)
  }

  const stopCamera = async () => {
    await scannerRef.current?.stop()
    setCameraActive(false)
  }

  useEffect(() => {
    return () => { scannerRef.current?.stop() }
  }, [])

  if (!saved) {
    return (
      <div className="min-h-screen bg-background flex-col items-center justify-center p-6">
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
    <div className="min-h-screen bg-background flex-col items-center justify-center p-6 s">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Scan Ticket</h2>
        <button
          onClick={() => {
            localStorage.removeItem("scan_password")
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
        variant="outline"
        onClick={cameraActive ? stopCamera : startCamera}
        className="w-full"
      >
        {cameraActive ? "Stop Camera" : "Scan QR Code"}
      </Button>
      {cameraActive && <div id="qr-reader" className="rounded-lg w-full max-w-md" />}

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
