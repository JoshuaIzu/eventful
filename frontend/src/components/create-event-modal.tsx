"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { BorderBeamButton } from "@/components/ui/border-beam-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateEvent } from "@/hooks/use-events"
import { toast } from "sonner"
import { IEvent } from "@/types";
import { uploadEventImage } from "@/lib/upload";
import { useImageFileHandler } from "@/lib/file-utils"

interface CreateEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: IEvent | null
}

export function CreateEventModal({ open, onOpenChange }: CreateEventModalProps) {
  const createEvent = useCreateEvent()
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    date: "",
    basePrice: 0,
    reminderType: "ONE_DAY" as "ONE_DAY" | "ONE_WEEK",
    pricingType: "STANDARD" as "STANDARD" | "EARLY_BIRD" | "VIP",
  })
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault()

    const submitDate = new Date(form.date);
    if (submitDate < new Date()){
      toast.error("Event date cannot be in the past");
      return;
    }
    try {
      let imageUrl: string | undefined
      if (imageFile) {
          setUploading(true)
          imageUrl = await uploadEventImage(imageFile)
      }
      await createEvent.mutateAsync({
        ...form,
        basePrice: Number(form.basePrice),
        ...(imageUrl ? { imageUrl } : {}),
      })
      toast.success("Event created successfully!")
      onOpenChange(false)
      setForm({ title: "", description: "", date: "", basePrice: 0, reminderType: "ONE_DAY", pricingType: "STANDARD" })
      setImageFile(null)
      setPreview(null)
    } catch (err) {
      toast.error("Failed to create event.")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }
  const handleFileChange  = useImageFileHandler(setImageFile, setPreview)

  const getLocalMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
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
            <Label htmlFor="image">Event Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={preview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-md border border-border" />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              min={getLocalMinDateTime()}
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
              disabled={createEvent.isPending || uploading}
            >
              {uploading ? "Uploading..." : createEvent.isPending ? "Creating..." : "Create Event"}
            </BorderBeamButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}