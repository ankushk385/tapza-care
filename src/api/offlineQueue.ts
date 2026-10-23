import { ApiError } from "./client";
import { request } from "./client";
import { createBooking } from "./mock/handlers";
import { useAppStore } from "../store/useAppStore";

/**
 * Offline booking queue.
 *
 * Confirming while the clinic server is unreachable keeps the intent on device
 * (`pendingBookings`). Every few seconds `flushPendingBookings` tries again.
 * Success moves the entry into the normal visits list; a 409 drops it (someone
 * else took the slot), and a network error leaves it queued for the next pass.
 */
export async function flushPendingBookings(): Promise<{ synced: number; remaining: number }> {
  const queue = useAppStore.getState().pendingBookings;
  let synced = 0;

  for (const pending of queue) {
    try {
      const booking = await request(() =>
        createBooking({ doctorId: pending.doctorId, slotId: pending.slotId }),
      );
      const store = useAppStore.getState();
      store.removePendingBooking(pending.id);
      store.addBooking(booking, pending.label);
      synced += 1;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // The slot is genuinely gone; don't retry it forever.
        useAppStore.getState().removePendingBooking(pending.id);
        continue;
      }
      // Still offline. Keep this and everything behind it queued.
      break;
    }
  }

  return { synced, remaining: useAppStore.getState().pendingBookings.length };
}
