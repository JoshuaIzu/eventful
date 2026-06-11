"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useVerifyPayment } from "@/hooks/use-checkout"
import { LoadingCarousel } from "@/components/ui/loading-carousel"
import { Button } from "@/components/ui/button"
import { BorderBeamButton } from "@/components/ui/border-beam-button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Ticket } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          >
        <Card className="bg-surface border-border w-full text-center p-8 space-y-6 overflow-hidden">
          <XCircle className="w-16 h-16 text-error mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Invalid Payment</h1>
            <p className="text-text-secondary">No payment reference was found.</p>
          </div>
          <Button onClick={() => router.push("/events")} className="w-full">
            Browse Events
          </Button>
        </Card>
        </motion.div>
      </div>
    )
  }

  if (isLoading || data?.status === "PENDING") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-surface border-border  w-full text-center p-8 space-y-6 overflow-hidden">
            <XCircle className="w-16 h-16 text-error mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Verification Failed</h1>
              <p className="text-text-secondary">
                We couldn't verify your payment. If you were charged, it will be
                reflected shortly.
              </p>
              <p className="text-xs text-text-muted font-mono break-all">{reference}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/tickets")} className="flex-1">
                My Tickets
              </Button>
              <Button onClick={() => router.push("/events")} className="flex-1">
                Browse Events
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  const isPaid = data?.status === "ALREADY_PAID" || data?.status === "JUST_PAID"

  if (isPaid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="bg-surface border-border  w-full text-center p-8 space-y-6 overflow-hidden">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-success mx-auto" />
            </motion.div>
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
            <div className="flex gap-3 pt-2">
              <Link href="/events" className="flex-1">
                <Button variant="outline" className="w-full">
                  Browse More
                </Button>
              </Link>
              <Link href="/tickets" className="flex-1">
                <BorderBeamButton className="w-full" variantColor="colorful">
                  View My Tickets
                </BorderBeamButton>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        >
        <Card className="bg-surface border-border w-full text-center p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Payment Status Unknown</h1>
            <p className="text-text-secondary">
              Your payment is still being processed. Check your tickets page for updates.
            </p>
          </div>
          <Button onClick={() => router.push("/tickets")} className="w-full">
            Go to My Tickets
          </Button>
        </Card>
      </motion.div>
    </div>
  )
}
