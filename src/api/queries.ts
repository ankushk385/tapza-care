import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAppStore } from "../store/useAppStore";
import type { Booking, Slot } from "../types/config";
import { ApiError, request } from "./client";
import type { ConfigVariant } from "./mock/configs";
import {
  createBooking,
  getConfig,
  getDoctors,
  getPrescriptions,
  getSlots,
} from "./mock/handlers";

export const queryKeys = {
  config: (variant: ConfigVariant) => ["config", variant] as const,
  doctors: ["doctors"] as const,
  slots: (doctorId: string, date: string) => ["slots", doctorId, date] as const,
  prescriptions: ["prescriptions"] as const,
};

export function useConfig(variant: ConfigVariant) {
  const cached = useAppStore((state) => state.configCache[variant]);
  const cacheConfig = useAppStore((state) => state.cacheConfig);

  const query = useQuery({
    queryKey: queryKeys.config(variant),
    queryFn: () => request(() => getConfig(variant)),
    // Render the last good config instantly; the refetch reconciles in the background.
    initialData: cached,
    initialDataUpdatedAt: 0,
    // Always revalidate when the variant changes: the server may have shipped a
    // new layout, and a failed fetch here is what proves the cache works.
    staleTime: 0,
    gcTime: 30 * 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data && !query.isError) {
      cacheConfig(variant, query.data);
    }
  }, [cacheConfig, query.data, query.isError, variant]);

  return {
    config: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    /** We have content on screen but the latest fetch failed: show a subtle banner. */
    isOffline: query.isError && Boolean(query.data),
    refetch: query.refetch,
    updatedAt: query.dataUpdatedAt,
  };
}

export function useDoctors() {
  return useQuery({
    queryKey: queryKeys.doctors,
    queryFn: () => request(getDoctors),
    staleTime: 5 * 60_000,
  });
}

export function useSlots(doctorId: string | null, date: string | null) {
  return useQuery({
    queryKey: queryKeys.slots(doctorId ?? "", date ?? ""),
    queryFn: () => request(() => getSlots(doctorId as string, date as string)),
    enabled: Boolean(doctorId && date),
    staleTime: 20_000,
    retry: 1,
  });
}

export function usePrescriptions() {
  return useQuery({
    queryKey: queryKeys.prescriptions,
    queryFn: () => request(getPrescriptions),
    staleTime: 60_000,
  });
}

export function isSlotTakenError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}

interface BookingInput {
  doctorId: string;
  slotId: string;
  date: string;
  /** What the user saw on the card, kept for the visits list. */
  label?: string;
}

interface BookingContext {
  previous?: Slot[];
}

/**
 * Optimistic booking: the slot disappears from the grid the moment the user
 * confirms, then the mock server either agrees or answers 409 and we roll back.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  const addBooking = useAppStore((state) => state.addBooking);

  return useMutation<Booking, unknown, BookingInput, BookingContext>({
    mutationFn: (input) =>
      request(() => createBooking({ doctorId: input.doctorId, slotId: input.slotId })),

    onMutate: async (input) => {
      const key = queryKeys.slots(input.doctorId, input.date);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Slot[]>(key);

      if (previous) {
        queryClient.setQueryData<Slot[]>(
          key,
          previous.map((slot) => (slot.id === input.slotId ? { ...slot, available: false } : slot)),
        );
      }

      return { previous };
    },

    onError: (_error, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.slots(input.doctorId, input.date), context.previous);
      }
    },

    onSuccess: (booking, input) => {
      addBooking(booking, input.label);
    },

    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slots(input.doctorId, input.date) });
    },
  });
}
