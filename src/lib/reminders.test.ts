import type { Prescription } from "../types/config";
import { buildDoseReminders, DOSE_HOURS } from "./reminders";

const NOW = new Date(2026, 9, 23, 9, 30); // 23 Oct 2026, 09:30 local

function prescription(overrides: Partial<Prescription> = {}): Prescription {
  return {
    id: "rx-1",
    issuedAt: "2026-10-22T09:00:00.000Z",
    doctorName: "Dr. Test",
    clinicName: "Test Clinic",
    medicines: [
      {
        id: "med-1",
        name: "Metformin",
        dose: "500 mg",
        days: 3,
        timing: ["morning", "night"],
      },
    ],
    ...overrides,
  };
}

describe("medicine reminder plan", () => {
  it("schedules one reminder per remaining dose day and timing", () => {
    const plan = buildDoseReminders([prescription()], NOW);

    // Morning today has passed (08:00 < 09:30), night today has not.
    // Day 2 and day 3 contribute two doses each: 1 + 2 + 2 = 5.
    expect(plan).toHaveLength(5);
    expect(plan[0]?.date.getDate()).toBe(23);
    expect(plan[0]?.timing).toBe("night");
    expect(plan[1]?.date.getDate()).toBe(24);
    expect(plan.every((reminder) => reminder.date > NOW)).toBe(true);
  });

  it("uses the morning / afternoon / night hours", () => {
    const plan = buildDoseReminders(
      [prescription({ medicines: [{ id: "m", name: "A", dose: "1 tab", days: 2, timing: ["morning", "afternoon", "night"] }] })],
      new Date(2026, 9, 22, 6, 0),
    );

    const hours = new Set(plan.map((reminder) => reminder.date.getHours()));
    expect(hours).toEqual(new Set([DOSE_HOURS.morning, DOSE_HOURS.afternoon, DOSE_HOURS.night]));
  });

  it("carries the prescription deep link and medicine name", () => {
    const plan = buildDoseReminders([prescription()], NOW);
    expect(plan[0]?.url).toBe("tapzacare://prescriptions/rx-1");
    expect(plan[0]?.body).toContain("Metformin");
  });

  it("returns nothing for an empty prescription list", () => {
    expect(buildDoseReminders([], NOW)).toEqual([]);
  });
});
