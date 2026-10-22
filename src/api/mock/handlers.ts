import type {
  Booking,
  Doctor,
  LayoutConfig,
  Prescription,
  Slot,
} from "../../types/config";
import { layoutConfigSchema, parseOrThrow } from "../../types/config";
import { ApiError } from "../client";
import { configVariants, type ConfigVariant } from "./configs";
import { doctors, prescriptions } from "./data";
import { useMockSettings } from "./settings";

/** In-memory writes, so a booked slot really is gone for the rest of the session. */
const bookedSlots = new Set<string>();

const SLOT_TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
] as const;

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) % 100000;
  }
  return h;
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = (hours ?? 0) * 60 + (mins ?? 0) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getConfig(variant: ConfigVariant): LayoutConfig {
  // Validate before it reaches the app, exactly like a real client would.
  return parseOrThrow(layoutConfigSchema, configVariants[variant], `config (${variant})`);
}

export function getDoctors(): Doctor[] {
  if (useMockSettings.getState().emptyLists) return [];
  return doctors;
}

export function getSlots(doctorId: string, date: string): Slot[] {
  if (!doctorId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError("doctorId and a date (YYYY-MM-DD) are required", 400);
  }

  const seed = hash(`${doctorId}|${date}`);

  return SLOT_TIMES.map((start, index) => {
    const id = `${doctorId}|${date}|${index}`;
    // Deterministic pseudo-availability so the grid looks lived-in but stable.
    const naturallyTaken = (seed + index * 7) % 5 === 0;
    const taken = naturallyTaken || bookedSlots.has(id);

    return {
      id,
      doctorId,
      startsAt: `${date}T${start}:00`,
      endsAt: `${date}T${addMinutes(start, 30)}:00`,
      available: !taken,
    };
  });
}

export function createBooking(input: { doctorId: string; slotId: string }): Booking {
  const { doctorId, slotId } = input;

  if (!doctorId || !slotId) {
    throw new ApiError("doctorId and slotId are required", 400);
  }

  if (useMockSettings.getState().takeConflict()) {
    throw new ApiError("That slot was just booked by someone else.", 409);
  }

  if (bookedSlots.has(slotId)) {
    throw new ApiError("That slot was just booked by someone else.", 409);
  }

  bookedSlots.add(slotId);

  return {
    id: `bk-${Date.now().toString(36)}`,
    doctorId,
    slotId,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
}

export function getPrescriptions(): Prescription[] {
  if (useMockSettings.getState().emptyLists) return [];
  return prescriptions;
}

/** Test hook: lets specs start from a clean booking table. */
export function resetMockBookings(): void {
  bookedSlots.clear();
}

/** Slot ids are `doctorId|date|index`, so a stored booking can be rendered. */
export function slotIdToTime(slotId: string): string | null {
  const index = Number(slotId.split("|")[2]);
  return SLOT_TIMES[index] ?? null;
}
