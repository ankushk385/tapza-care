import { create } from "zustand";

export type Latency = 0 | 800 | 2500;
export type FailMode = "off" | "next" | "always";

interface MockSettingsState {
  /** Simulated round-trip time for every mock request. */
  latency: Latency;
  /** `next` fails a single request, `always` fails until switched off. */
  failMode: FailMode;
  /** Makes list endpoints return `[]` so empty states can be demoed. */
  emptyLists: boolean;
  /** Makes the next booking fail with 409, i.e. someone grabbed the slot first. */
  conflictNext: boolean;
  setLatency: (latency: Latency) => void;
  setFailMode: (failMode: FailMode) => void;
  setEmptyLists: (emptyLists: boolean) => void;
  setConflictNext: (conflictNext: boolean) => void;
  /** Called by the mock client for every request; may consume a one-shot failure. */
  takeFailure: () => boolean;
  /** Called by POST /bookings; may consume a one-shot 409. */
  takeConflict: () => boolean;
}

/**
 * Deliberately not persisted: every reload starts from a healthy network so a
 * forgotten "always fail" toggle cannot make the app look broken.
 */
export const useMockSettings = create<MockSettingsState>((set, get) => ({
  latency: 800,
  failMode: "off",
  emptyLists: false,
  conflictNext: false,
  setLatency: (latency) => set({ latency }),
  setFailMode: (failMode) => set({ failMode }),
  setEmptyLists: (emptyLists) => set({ emptyLists }),
  setConflictNext: (conflictNext) => set({ conflictNext }),
  takeConflict: () => {
    if (!get().conflictNext) return false;
    set({ conflictNext: false });
    return true;
  },
  takeFailure: () => {
    const { failMode } = get();
    if (failMode === "next") {
      set({ failMode: "off" });
      return true;
    }
    return failMode === "always";
  },
}));
