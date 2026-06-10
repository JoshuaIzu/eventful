"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEvent } from "@/hooks/use-events"
import { LoadingCarousel } from "@/components/ui/loading-carousel"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BorderBeamButton } from "@/components/ui/border-beam-button"
import { PriceTag } from "@/components/price-tag"
import { ShieldCheck, ArrowLeft, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "@/components/payment-modal"
import { useCheckout } from "@/hooks/use-checkout"
import { toast } from "sonner"

export default function CheckoutPage() {
  const { eventId } = useParams()
  const router = useRouter()
  const { data: event, isLoading } = useEvent(eventId as string)
  const checkout = useCheckout()
  const [isModalOpen, setModalOpen] = React.useState(false)

  const handlePayment = async () => {
    try {
      const result = await checkout.mutateAsync({ eventId: eventId as string })
      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl
      } else {
        toast.error("Failed to initiate payment. Please try again.")
      }
    } catch (err) {
      toast.error("An error occurred during checkout.")
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingCarousel tips={["Preparing your secure checkout...", "Almost there!"]} />
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md space-y-8">
        <Button variant="ghost" className="text-text-secondary hover:text-text-primary p-0" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to event
        </Button>

        <Card className="bg-surface border-border shadow-2xl">
          <CardHeader className="border-b border-border bg-surface-elevated">
            <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                Checkout Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <p className="text-text-secondary text-sm font-mono">
                        {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </p>
                </div>
                <PriceTag price={event.calculatedPrice} />
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm text-text-secondary">
                    <span>Ticket Quantity</span>
                    <span className="font-mono">1x</span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                    <span>Service Fee</span>
                    <span className="font-mono text-success">FREE</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="font-bold">Total Amount</span>
                <PriceTag price={event.calculatedPrice} className="text-2xl" />
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-surface-elevated/50 flex flex-col gap-4">
             <BorderBeamButton
              className="w-full"
              size="lg"
              variantColor="colorful"
              onClick={() => setModalOpen(true)}
             >
               Pay with Paystack
             </BorderBeamButton>
             <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                <ShieldCheck className="w-4 h-4" />
                Secured by Paystack
             </div>
          </CardFooter>
        </Card>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handlePayment}
        amount={event.calculatedPrice}
      />
    </div>
  )
}
