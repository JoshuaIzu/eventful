import { api } from "./api";

export async function uploadEventImage(file: File): Promise<string> {
    const formData  = new FormData();
    formData.append("image", file);

    const res = await api.post<{ imageUrl: string }>("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        });

    return res.data.imageUrl;
}