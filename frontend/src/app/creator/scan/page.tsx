"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Scan as ScanIcon, ArrowLeft, ShieldCheck, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"

export default function QRScannerPage() {
  const router = useRouter()
  const [ticketId, setTicketId] = React.useState("")
  const [eventId, setEventId] = React.useState("")
  const [isScanning, setIsScanning] = React.useState(false)
  const [lastResult, setLastResult] = React.useState<{ success: boolean, message: string } | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketId || !eventId) {
      toast.error("Ticket ID and Event ID are required.")
      return
    }

    try {
      const { data } = await api.post("/scan", { ticketId, eventId }, {
        headers: {
          'x-scan-id': process.env.NEXT_PUBLIC_SCAN_PASSWORD || 'secret'
        }
      })
      setLastResult({ success: true, message: data.message })
      toast.success(data.message)
      setTicketId("")
    } catch (err: any) {
      const message = err.response?.data?.message || "Scan failed."
      setLastResult({ success: false, message })
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <header className="p-4 border-b border-border flex items-center gap-4 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Ticket Scanner</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 space-y-8">
        <div className="relative w-full max-w-sm sm:max-w-2xl sm:max-h-[600px] aspect-square">
          {/* Mock Camera View */}
          <div className="absolute inset-0 bg-surface rounded-3xl border-2 border-border overflow-hidden flex flex-col items-center justify-center text-center p-8 gap-4">
            <div className="relative">
                 <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-accent" />
                 <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-accent" />
                 <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-accent" />
                 <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-accent" />
                 <Camera className="w-16 h-16 text-text-muted opacity-20" />
            </div>
            <p className="text-text-muted text-sm font-mono uppercase tracking-widest">
              Camera entry requires <br /> mobile browser
            </p>
            <Button variant="outline" className="border-accent text-accent">
                Enable Camera
            </Button>
          </div>
          
          {/* Scan result overlay */}
          {lastResult && (
              <div className={cn(
                  "absolute inset-x-4 bottom-4 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2",
                  lastResult.success ? "bg-success/10 border-success text-success" : "bg-error/10 border-error text-error"
              )}>
                  {lastResult.success ? <ShieldCheck className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <span className="text-sm font-bold">{lastResult.message}</span>
              </div>
          )}
        </div>

        <form onSubmit={handleScan} className="w-full max-w-sm space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-text-secondary font-mono text-[10px] uppercase">Manual Event ID</Label>
              <Input 
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="UUID of the event"
                className="bg-surface border-border font-mono text-sm min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-text-secondary font-mono text-[10px] uppercase">Manual Ticket ID</Label>
              <div className="flex gap-2">
                <Input 
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Scan result or UUID"
                  className="bg-surface border-border font-mono text-sm min-h-[44px]"
                />
                <Button type="submit" size="icon" className="bg-accent hover:bg-accent-glow shrink-0 min-h-[44px] min-w-[44px]">
                  <ScanIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>

        <Card className="w-full max-w-sm bg-surface/30 border-dashed border-border">
            <CardContent className="p-4 text-center">
                <p className="text-xs text-text-muted">
                    Scanning requires authorization. Ensure <code>SCAN_PASSWORD</code> is correctly configured.
                </p>
            </CardContent>
        </Card>
      </main>
    </div>
  )
}

import { cn } from "@/lib/utils"
