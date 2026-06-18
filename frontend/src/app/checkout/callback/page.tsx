"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useVerifyPayment } from "@/hooks/use-checkout"
import { LoadingCarousel } from "@/components/ui/loading-carousel"
import { Button } from "@/components/ui/button"
import { BorderBeamButton } from "@/components/ui/border-beam-button"
import { CheckCircle, XCircle, Ticket } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-background grid place-items-center p-4">
        <LoadingCarousel tips={["Loading..."]} />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get("reference")

  const { data, isLoading, isError } = useVerifyPayment(reference ?? "")

  if (!reference) {
    return (
      <div className="min-h-screen w-full bg-background grid place-items-center p-4 sm:p-8">
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          >
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6 w-full min-w-[300px] text-center">
          <XCircle className="w-16 h-16 text-error mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Invalid Payment</h1>
            <p className="text-text-secondary">No payment reference was found.</p>
          </div>
          <Button onClick={() => router.push("/events")} className="w-full">
            Browse Events
          </Button>
        </div>
        </motion.div>
      </div>
    )
  }

  if (isLoading || data?.status === "PENDING") {
    return (
      <div className="min-h-screen w-full bg-background grid place-items-center p-4">
        <LoadingCarousel
          tips={[
            "Verifying your payment...",
            "This may take a few seconds",
            "Please do not close this page",
          ]}
        />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen w-full bg-background grid place-items-center p-4 sm:p-8">
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6 w-full min-w-[300px] text-center">
            <XCircle className="w-16 h-16 text-error mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Verification Failed</h1>
              <p className="text-text-secondary">
                We couldn't verify your payment. If you were charged, it will be
                reflected shortly.
              </p>
              <p className="text-xs text-text-muted font-mono break-all">{reference}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => router.push("/tickets")} className="flex-1 min-h-[44px]">
                My Tickets
              </Button>
              <Button onClick={() => router.push("/events")} className="flex-1">
                Browse Events
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const isPaid = data?.status === "ALREADY_PAID" || data?.status === "JUST_PAID"

  if (isPaid) {
    return (
      <div className="min-h-screen w-full bg-background grid place-items-center p-4 sm:p-8">
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl w-full min-w-[300px] text-center">
            <motion.div
              className="mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.25 }}
            >
              <CheckCircle className="w-16 h-16 text-success mx-auto" />
            </motion.div>
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
            >
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Payment Successful!</h1>
              <p className="text-text-secondary">
                Your ticket has been confirmed. A receipt has been sent to your email.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-success/5 border border-success/20 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <Ticket className="w-4 h-4 text-accent shrink-0" />
                <span className="font-mono text-xs break-all">{reference}</span>
              </div>
              <p className="text-sm text-text-secondary">
                Amount paid:{" "}
                <span className="font-bold text-text-primary">
                  {data?.ticket?.amountPaid != null
                    ? `$${data.ticket.amountPaid.toFixed(2)}`
                    : "—"}
                </span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/events" className="flex-1">
                <Button variant="outline" className="w-full min-h-[44px]">
                  Browse More
                </Button>
              </Link>
              <Link href="/tickets" className="flex-1">
                <BorderBeamButton className="w-full min-h-[44px]" variantColor="colorful">
                  View My Tickets
                </BorderBeamButton>
              </Link>
            </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="min-h-screen w-full bg-background grid place-items-center p-4 sm:p-8">
      <motion.div
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        >
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6 w-full min-w-[300px] text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Payment Status Unknown</h1>
            <p className="text-text-secondary">
              Your payment is still being processed. Check your tickets page for updates.
            </p>
          </div>
          <Button onClick={() => router.push("/tickets")} className="w-full min-h-[44px]">
            Go to My Tickets
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
