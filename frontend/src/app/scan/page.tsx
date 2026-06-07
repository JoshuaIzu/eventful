"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useScanTicket } from "@/hooks/use-scan";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Scan, ShieldCheck, XCircle, KeyRound, Camera } from "lucide-react";

// ── Password gate ──────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    localStorage.setItem("eventful_scan_password", password);
    onUnlock();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
            <KeyRound className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Ticket Scanner
          </h1>
          <p className="text-sm text-text-muted max-w-xs mx-auto">
            Enter the scan password provided by the event organizer. No account
            needed.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4"
        >
          <div className="space-y-1.5">
            <Label className="text-text-secondary text-sm">Scan Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="min-h-[44px]"
            />
          </div>
          <Button
            type="submit"
            className="w-full min-h-[44px]"
            size="lg"
            disabled={!password}
          >
            Unlock Scanner
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Scanner UI ─────────────────────────────────────────────────────────────────
function ScannerView() {
  const scan = useScanTicket();
  const [ticketId, setTicketId] = React.useState("");
  const [eventId, setEventId] = React.useState("");
  const [lastResult, setLastResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || !eventId) return;
    scan.mutate(
      { ticketId, eventId },
      {
        onSuccess: (data) => {
          setLastResult({ success: true, message: data.message });
          setTicketId("");
        },
        onError: (err: any) => {
          setLastResult({
            success: false,
            message: err?.response?.data?.message ?? "Scan failed",
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <header className="p-4 border-b border-border flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Scan className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-bold">Ticket Scanner</h1>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("eventful_scan_password");
            window.location.reload();
          }}
          className="text-xs text-text-muted hover:text-text-primary underline"
        >
          Change password
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 space-y-8">
        {/* Viewfinder */}
        <div className="relative w-full max-w-sm sm:max-w-2xl sm:max-h-[600px] aspect-square">
          <div className="absolute inset-0 bg-surface rounded-3xl border-2 border-border overflow-hidden flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="relative p-6">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent" />
              <Camera className="w-16 h-16 text-text-muted opacity-20" />
            </div>
            <p className="text-text-muted text-sm font-mono uppercase tracking-widest">
              Camera entry requires
              <br />
              mobile browser
            </p>
            <Button
              variant="outline"
              className="border-accent text-accent"
              size="sm"
            >
              Enable Camera
            </Button>
          </div>

          {lastResult && (
            <motion.div
              key={lastResult.message}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "absolute inset-x-4 bottom-4 p-4 rounded-xl border flex items-center gap-3",
                lastResult.success
                  ? "bg-success/10 border-success text-success"
                  : "bg-error/10 border-error text-error",
              )}
            >
              {lastResult.success ? (
                <ShieldCheck className="w-5 h-5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0" />
              )}
              <span className="text-sm font-bold">{lastResult.message}</span>
            </motion.div>
          )}
        </div>

        {/* Manual entry form */}
        <form onSubmit={handleScan} className="w-full max-w-sm space-y-4">
          <div className="space-y-1.5">
            <Label className="text-text-secondary font-mono text-[10px] uppercase tracking-widest">
              Event ID
            </Label>
            <Input
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="UUID of the event"
              className="bg-surface border-border font-mono text-sm min-h-[44px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-text-secondary font-mono text-[10px] uppercase tracking-widest">
              Ticket ID
            </Label>
            <div className="flex gap-2">
              <Input
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Scan result or UUID"
                className="bg-surface border-border font-mono text-sm min-h-[44px]"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-accent hover:bg-accent-glow shrink-0 min-h-[44px] min-w-[44px]"
                disabled={scan.isPending || !ticketId || !eventId}
              >
                <Scan className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

// ── Route default export ───────────────────────────────────────────────────────
export default function ScanPage() {
  const [unlocked, setUnlocked] = React.useState(false);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("eventful_scan_password");
    const env = process.env.NEXT_PUBLIC_SCAN_PASSWORD;
    if (env && !stored) localStorage.setItem("eventful_scan_password", env);
    if (stored || env) setUnlocked(true);
    setChecked(true);
  }, []);

  if (!checked) return null; // avoid flash

  return unlocked ? (
    <ScannerView />
  ) : (
    <PasswordGate onUnlock={() => setUnlocked(true)} />
  );
}
