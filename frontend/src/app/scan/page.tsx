"use client";

import * as React from "react";
import { QRScanner } from "@/components/qr-scanner";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function ScanPage() {
  const [eventId] = React.useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("eventId") || "";
    }
    return "";
  });

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <main className="flex-1 pb-20 sm:pb-0">
        <QRScanner eventId={eventId} />
      </main>
      <MobileNav />
    </div>
  );
}
