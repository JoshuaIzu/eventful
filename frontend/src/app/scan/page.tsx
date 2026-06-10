"use client";

import * as React from "react";
import { QRScanner } from "@/components/qr-scanner";

export default function ScanPage() {
  const [eventId] = React.useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("eventId") || "";
    }
    return "";
  });

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <QRScanner eventId={eventId} />
    </div>
  );
}
