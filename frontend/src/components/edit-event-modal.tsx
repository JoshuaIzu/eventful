"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { BorderBeamButton } from "@/components/ui/border-beam-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateEvent } from "@/hooks/use-events"
import { toast } from "sonner"
import type { IEvent } from "@/types"

interface EditEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: IEvent | null
}

function toLocalDatetime(isoDate: string) {
  const date = new Date(isoDate)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export function EditEventModal({ open, onOpenChange, event }: EditEventModalProps) {
  const updateEvent = useUpdateEvent()
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    date: "",
    basePrice: 0,
    reminderType: "ONE_DAY" as "ONE_DAY" | "ONE_WEEK",
    pricingType: "STANDARD" as "STANDARD" | "EARLY_BIRD" | "VIP",
  })

  React.useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description,
        date: toLocalDatetime(event.date),
        basePrice: event.basePrice,
        reminderType: event.reminderType,
        pricingType: event.pricingType,
      })
    }
  }, [event])

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    if (!event) return

    try {
      await updateEvent.mutateAsync({
        id: event.id,
        data: {
          ...form,
          basePrice: Number(form.basePrice),
        },
      })
      toast.success("Event updated successfully!")
      onOpenChange(false)
    } catch (err) {
      toast.error("Failed to update event.")
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="My Awesome Event"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Event description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price ($)</Label>
            <Input
              id="basePrice"
              type="number"
              min="0"
              step="0.01"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminderType">Reminder</Label>
              <select
                id="reminderType"
                value={form.reminderType}
                onChange={(e) => setForm({ ...form, reminderType: e.target.value as "ONE_DAY" | "ONE_WEEK" })}
                className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="ONE_DAY">1 Day Before</option>
                <option value="ONE_WEEK">1 Week Before</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricingType">Pricing</Label>
              <select
                id="pricingType"
                value={form.pricingType}
                onChange={(e) => setForm({ ...form, pricingType: e.target.value as "STANDARD" | "EARLY_BIRD" | "VIP" })}
                className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="STANDARD">Standard</option>
                <option value="EARLY_BIRD">Early Bird</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <BorderBeamButton
              type="submit"
              variantColor="sunset"
              disabled={updateEvent.isPending}
            >
              {updateEvent.isPending ? "Saving..." : "Save Changes"}
            </BorderBeamButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}