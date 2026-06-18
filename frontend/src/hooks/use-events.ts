"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import type { IEvent } from "@/types";

export function useEvents() {
  return useQuery<IEvent[]>({
    queryKey: ["events"],
    queryFn: () => api.get("/events/popular").then((r) => r.data),
    staleTime: 60 * 1000,
  });
}


export function useMyEvents() {
  return useQuery<IEvent[]>({
    queryKey: ["events", "my"],
    queryFn: () => api.get("/events/my-events").then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

export function useEvent(id: string) {
  return useQuery<IEvent>({
    queryKey: ["events", id],
    queryFn: () => api.get(`/events/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  return useMutation({
    mutationFn: (data: any) => api.post("/events", data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/events/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}


