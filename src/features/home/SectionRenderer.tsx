import type { SharedValue } from "react-native-reanimated";

import type { HomeSection, TabTarget } from "../../types/config";
import { AnimatedSection } from "./AnimatedSection";
import { SectionBand } from "./band";
import { CategoryChips } from "./sections/CategoryChips";
import { DoctorCarousel } from "./sections/DoctorCarousel";
import { HeroBanner } from "./sections/HeroBanner";
import { OfferStrip } from "./sections/OfferStrip";
import { QuickActions } from "./sections/QuickActions";
import { ServiceGrid } from "./sections/ServiceGrid";

export interface SectionActions {
  onBookDoctor: (doctorId: string) => void;
  onBookService: (name: string, priceInr: number, imageUrl?: string) => void;
  onNavigate: (tab: TabTarget) => void;
}

/**
 * The heart of the brief: a registry, not a page.
 *
 * `switch` on `section.type` with `null` as the default means a section type
 * this build has never seen renders nothing and cannot crash the home screen.
 * Adding a new section type is one new case and one new component.
 */
export function SectionRenderer({
  section,
  scrollY,
  viewportHeight,
  actions,
}: {
  section: HomeSection;
  scrollY: SharedValue<number>;
  viewportHeight: number;
  actions: SectionActions;
}) {
  const content = renderSection(section, scrollY, actions);
  if (!content) return null;

  return (
    <AnimatedSection scrollY={scrollY} viewportHeight={viewportHeight}>
      <SectionBand background={section.background}>{content}</SectionBand>
    </AnimatedSection>
  );
}

export function renderSection(
  section: HomeSection,
  scrollY: SharedValue<number>,
  actions: SectionActions,
) {
  switch (section.type) {
    case "hero_banner":
      return (
        <HeroBanner
          section={section}
          scrollY={scrollY}
          onBook={() => actions.onBookService("Clinic visit", 400)}
        />
      );
    case "category_chips":
      return <CategoryChips section={section} onPress={(label) => actions.onBookService(label, 0)} />;
    case "quick_actions":
      return <QuickActions section={section} onNavigate={actions.onNavigate} />;
    case "service_grid":
      return <ServiceGrid section={section} onBook={actions.onBookService} />;
    case "doctor_carousel":
      return <DoctorCarousel section={section} onBook={actions.onBookDoctor} />;
    case "offer_strip":
      return <OfferStrip section={section} />;
    default:
      // Unknown type from a newer server: skip silently, never throw.
      return null;
  }
}
