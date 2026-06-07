"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as React from "react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (email: string) => void
  amount: number
}

export function PaymentModal({ isOpen, onClose, onConfirm, amount }: PaymentModalProps) {
  const [email, setEmail] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      onConfirm(email)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-surface border-border p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Confirm Purchase</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Enter your email address to receive your ticket and proceed to payment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-text-secondary">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-text-primary font-mono min-h-[44px]"
              required
            />
          </div>
          <div className="flex justify-between items-center pt-2">
             <span className="text-text-muted text-sm uppercase font-mono">Total to pay</span>
             <span className="text-xl font-bold text-accent font-mono">${(amount / 100).toFixed(2)}</span>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="submit" className="w-full bg-accent hover:bg-accent-glow text-white min-h-[44px]">
              Proceed to Paystack
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
