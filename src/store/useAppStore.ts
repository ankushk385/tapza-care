import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ConfigVariant } from "../api/mock/configs";
import type { Booking, LayoutConfig, TabTarget } from "../types/config";

export interface BookingTarget {
  kind: "doctor" | "service";
  id: string;
  name: string;
  subtitle: string;
  feeInr: number;
  photoUrl?: string;
}

interface AppState {
  /** Which config the app is currently rendering: normal day or festival. */
  variant: ConfigVariant;
  /** Last good config per variant, so a failed fetch never blanks the screen. */
  configCache: Partial<Record<ConfigVariant, LayoutConfig>>;
  /** `prescriptionId:medicineId:timing:YYYY-MM-DD` -> taken. Persisted. */
  takenDoses: Record<string, true>;
  /** Optimistically confirmed bookings, persisted so the tab survives a reload. */
  bookings: Booking[];
  /** `slotId` -> what was booked ("Full body checkup", "Dr. Ananya Rao"), so
   *  a service booking keeps its name in the visits list. */
  bookingLabels: Record<string, string>;

  setVariant: (variant: ConfigVariant) => void;
  cacheConfig: (variant: ConfigVariant, config: LayoutConfig) => void;
  toggleDose: (key: string) => void;
  addBooking: (booking: Booking, label?: string) => void;
  clearData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      variant: "normal",
      configCache: {},
      takenDoses: {},
      bookings: [],
      bookingLabels: {},

      setVariant: (variant) => set({ variant }),
      cacheConfig: (variant, config) =>
        set((state) => ({ configCache: { ...state.configCache, [variant]: config } })),
      toggleDose: (key) =>
        set((state) => {
          const next = { ...state.takenDoses };
          if (next[key]) {
            delete next[key];
          } else {
            next[key] = true;
          }
          return { takenDoses: next };
        }),
      addBooking: (booking, label) =>
        set((state) => ({
          bookings: [booking, ...state.bookings.filter((b) => b.slotId !== booking.slotId)],
          bookingLabels: label
            ? { ...state.bookingLabels, [booking.slotId]: label }
            : state.bookingLabels,
        })),
      clearData: () => set({ takenDoses: {}, bookings: [], bookingLabels: {} }),
    }),
    {
      name: "tapza-care-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        variant: state.variant,
        configCache: state.configCache,
        takenDoses: state.takenDoses,
        bookings: state.bookings,
        bookingLabels: state.bookingLabels,
      }),
    },
  ),
);

/** Stable key for a single dose of a medicine on a given day. */
export function doseKey(
  prescriptionId: string,
  medicineId: string,
  timing: string,
  date: string,
): string {
  return `${prescriptionId}:${medicineId}:${timing}:${date}`;
}

export function targetToTab(target?: TabTarget): TabTarget | undefined {
  return target;
}
