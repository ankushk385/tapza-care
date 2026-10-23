import { getStateFromPath } from "@react-navigation/native";

import { linking } from "./linking";

/**
 * Deep link paths are easy to break silently when a navigator is renamed, so
 * they are tested at the routing-table level without mounting the app.
 */
function routesFor(path: string) {
  // getStateFromPath expects the path portion; strip the custom scheme/prefix.
  const normalized = path.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  return getStateFromPath(normalized, linking.config);
}

describe("deep link paths", () => {
  it("opens a doctor's booking sheet from a doctor link", () => {
    const state = routesFor("tapzacare://doctor/doc-ananya");
    expect(state?.routes[0]?.name).toBe("home");
    expect(state?.routes[0]?.params).toEqual({ doctorId: "doc-ananya" });
  });

  it("opens a prescription detail from a notification link", () => {
    const state = routesFor("tapzacare://prescriptions/rx-1");
    const nested = state?.routes[0]?.state?.routes ?? [];
    expect(state?.routes[0]?.name).toBe("prescriptions");
    expect(nested.at(-1)?.name).toBe("PrescriptionDetail");
    expect(nested.at(-1)?.params).toEqual({ id: "rx-1" });
  });

  it("opens the prescriptions list without an id", () => {
    const state = routesFor("tapzacare://prescriptions");
    expect(state?.routes[0]?.name).toBe("prescriptions");
  });

  it("maps the visits tab", () => {
    expect(routesFor("tapzacare://visits")?.routes[0]?.name).toBe("bookings");
  });
});
