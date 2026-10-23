import type { LinkingOptions } from "@react-navigation/native";

import type { TabParamList } from "./types";

/**
 * Deep links.
 *
 *   tapzacare://doctor/doc-ananya      → Home, opens the booking sheet
 *   tapzacare://prescriptions/rx-1     → that prescription's detail screen
 *   tapzacare://visits                 → the visits tab
 *
 * The scheme is declared in app.json; this table is the JS side of it. Local
 * medicine reminders carry the prescription URL in their payload, so tapping a
 * notification lands on the right dose schedule.
 */
export const linking: LinkingOptions<TabParamList> = {
  prefixes: ["tapzacare://"],
  config: {
    screens: {
      home: { path: "doctor/:doctorId" },
      bookings: "visits",
      prescriptions: {
        screens: {
          PrescriptionsList: "prescriptions",
          PrescriptionDetail: "prescriptions/:id",
        },
      },
      profile: "profile",
    },
  },
};
