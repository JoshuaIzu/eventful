"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as React from "react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  amount: number
}

export function PaymentModal({ isOpen, onClose, onConfirm, amount }: PaymentModalProps) {
  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-surface border-border p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Confirm Purchase</DialogTitle>
          <DialogDescription className="text-text-secondary">
            You are about to purchase a ticket. Payment will be processed via Paystack.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex justify-between items-center p-4 rounded-xl bg-background border border-border">
             <span className="text-text-muted text-sm uppercase font-mono">Total to pay</span>
             <span className="text-xl font-bold text-accent font-mono">${amount.toFixed(2)}</span>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="submit" className="w-full bg-accent hover:bg-accent-glow text-white min-h-11">
              Proceed to Paystack
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
