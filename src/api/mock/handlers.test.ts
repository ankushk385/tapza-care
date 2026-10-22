import { ApiError } from "../client";
import { createBooking, getConfig, getSlots, resetMockBookings, slotIdToTime } from "./handlers";
import { useMockSettings } from "./settings";

const DOCTOR = "doc-ananya";
const DATE = "2026-10-22";

function firstAvailableSlotId(): string {
  const slot = getSlots(DOCTOR, DATE).find((entry) => entry.available);
  if (!slot) throw new Error("Fixture has no available slot");
  return slot.id;
}

function expectApiError(run: () => unknown, status: number): void {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(status);
    return;
  }
  throw new Error(`Expected an ApiError with status ${status}`);
}

beforeEach(() => {
  resetMockBookings();
  useMockSettings.setState({
    latency: 0,
    failMode: "off",
    emptyLists: false,
    conflictNext: false,
  });
});

describe("mock clinic API", () => {
  it("returns the same availability twice for the same doctor and date", () => {
    const first = getSlots(DOCTOR, DATE);
    const second = getSlots(DOCTOR, DATE);

    expect(first).toHaveLength(12);
    expect(first.map((slot) => slot.id)).toEqual(second.map((slot) => slot.id));
    expect(first.map((slot) => slot.available)).toEqual(second.map((slot) => slot.available));
    expect(slotIdToTime(first[0]!.id)).toBe("09:00");
  });

  it("removes a slot after booking and answers 409 on the second attempt", () => {
    const slotId = firstAvailableSlotId();

    const booking = createBooking({ doctorId: DOCTOR, slotId });

    expect(booking.status).toBe("confirmed");
    expect(getSlots(DOCTOR, DATE).find((slot) => slot.id === slotId)?.available).toBe(false);
    expectApiError(() => createBooking({ doctorId: DOCTOR, slotId }), 409);
  });

  it("consumes the forced conflict once, so the retry succeeds", () => {
    const slotId = firstAvailableSlotId();
    useMockSettings.getState().setConflictNext(true);

    expectApiError(() => createBooking({ doctorId: DOCTOR, slotId }), 409);
    expect(useMockSettings.getState().conflictNext).toBe(false);

    expect(createBooking({ doctorId: DOCTOR, slotId }).status).toBe("confirmed");
  });

  it("validates input and returns an empty list when the demo asks for one", () => {
    expectApiError(() => createBooking({ doctorId: "", slotId: "" }), 400);
    expectApiError(() => getSlots("", DATE), 400);

    useMockSettings.getState().setEmptyLists(true);
    expect(getConfig("normal").sections.length).toBeGreaterThan(0);
  });
});
