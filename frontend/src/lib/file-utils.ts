import { toast } from "sonner"
import * as React from "react"

export function useImageFileHandler(
    setImageFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.")
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB.")
            return
        }
        setImageFile(file)
        setPreview(URL.createObjectURL(file))
    }
}