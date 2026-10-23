import type { SharedValue } from "react-native-reanimated";

/**
 * The section registry is the riskiest piece of the brief: a payload can ship a
 * type this build has never seen. These tests pin the two halves of that
 * contract — a known type resolves to its component, an unknown one to `null`.
 *
 * The renderers themselves pull in Reanimated/Expo native modules that Jest
 * cannot boot, so they are stubbed. The mapping under test is pure.
 */
jest.mock("./AnimatedSection", () => ({ AnimatedSection: () => null }));
jest.mock("./band", () => ({ SectionBand: () => null }));
jest.mock("./sections/CategoryChips", () => ({ CategoryChips: () => null }));
jest.mock("./sections/DoctorCarousel", () => ({ DoctorCarousel: () => null }));
jest.mock("./sections/HeroBanner", () => ({ HeroBanner: () => null }));
jest.mock("./sections/OfferStrip", () => ({ OfferStrip: () => null }));
jest.mock("./sections/QuickActions", () => ({ QuickActions: () => null }));
jest.mock("./sections/ServiceGrid", () => ({ ServiceGrid: () => null }));

import { festivalConfig } from "../../api/mock/configs";
import type { HomeSection } from "../../types/config";
import { renderSection, type SectionActions } from "./SectionRenderer";
import { OfferStrip } from "./sections/OfferStrip";

const scrollY = { value: 0 } as unknown as SharedValue<number>;

const actions: SectionActions = {
  onBookDoctor: () => undefined,
  onBookService: () => undefined,
  onNavigate: () => undefined,
};

function section(type: string): HomeSection {
  return {
    id: `sec-${type}`,
    type,
    background: { kind: "color", value: "#FFFFFF" },
    title: "Test",
    items: [],
  };
}

describe("section renderer", () => {
  it("maps ship-listed types to their component", () => {
    expect(renderSection(section("offer_strip"), scrollY, actions)?.type).toBe(OfferStrip);

    for (const type of [
      "hero_banner",
      "category_chips",
      "quick_actions",
      "service_grid",
      "doctor_carousel",
      "offer_strip",
    ]) {
      expect(renderSection(section(type), scrollY, actions)).not.toBeNull();
    }
  });

  it("returns null for a section type this build has never implemented", () => {
    const unknown = festivalConfig.sections.find((entry) => entry.type === "scratch_card");
    expect(unknown).toBeDefined();
    expect(renderSection(unknown ?? section("scratch_card"), scrollY, actions)).toBeNull();
  });
});
