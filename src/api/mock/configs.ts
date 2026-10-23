import type { LayoutConfig } from "../../types/config";

/**
 * Two payloads for GET /config. The app never ships layout in code: the normal
 * and festival variants differ only here. Switch at runtime from Profile → Dev
 * tools, or long-press the home greeting.
 */

const IMAGES = {
  clinic:
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=80",
  diya:
    "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=900&q=80",
  checkup:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
  consult:
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
  medicine:
    "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80",
  lab: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600&q=80",
  pharmacy:
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&q=80",
  homeCare:
    "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&q=80",
} as const;

export const normalConfig: LayoutConfig = {
  version: 3,
  theme: {
    primary: "#0E7C6B",
    secondary: "#2BA79A",
    accent: "#E8890C",
    background: "#F4F7F6",
    surface: "#FFFFFF",
    textPrimary: "#0C1F1C",
    textSecondary: "#566863",
    festival: null,
  },
  tabs: [
    { id: "tab-home", label: "Home", icon: "home", screen: "home" },
    { id: "tab-bookings", label: "Bookings", icon: "calendar", screen: "bookings" },
    { id: "tab-rx", label: "Medicines", icon: "medkit", screen: "prescriptions" },
    { id: "tab-profile", label: "Profile", icon: "person", screen: "profile" },
  ],
  sections: [
    {
      id: "sec-hero",
      type: "hero_banner",
      title: "Tapza Clinic, Jubilee Hills",
      background: { kind: "gradient", value: "#0E7C6B,#17A18C" },
      items: [
        {
          id: "hero-1",
          imageUrl: IMAGES.clinic,
          greeting: "Namaste, Anjali",
          subtitle: "Your family's health, one tap away.",
          ctaLabel: "Book a visit",
        },
      ],
    },
    {
      id: "sec-categories",
      type: "category_chips",
      title: "What do you need today?",
      background: { kind: "color", value: "#F4F7F6" },
      items: [
        { id: "cat-consult", label: "Consult", icon: "stethoscope" },
        { id: "cat-lab", label: "Lab tests", icon: "flask" },
        { id: "cat-pharmacy", label: "Pharmacy", icon: "medkit" },
        { id: "cat-vaccines", label: "Vaccines", icon: "shield" },
        { id: "cat-home", label: "Home care", icon: "home" },
      ],
    },
    {
      id: "sec-quick",
      type: "quick_actions",
      title: "Quick actions",
      background: { kind: "color", value: "#E9F2F0" },
      items: [
        { id: "qa-book", label: "Book", icon: "calendar", target: "bookings" },
        { id: "qa-rx", label: "Prescriptions", icon: "document", target: "prescriptions" },
        { id: "qa-reminders", label: "Reminders", icon: "alarm", target: "prescriptions" },
        { id: "qa-family", label: "Family", icon: "people", target: "profile" },
      ],
    },
    {
      id: "sec-services",
      type: "service_grid",
      title: "Popular at Tapza",
      background: { kind: "color", value: "#FFFFFF" },
      items: [
        {
          id: "svc-checkup",
          name: "Full body checkup",
          priceInr: 1499,
          imageUrl: IMAGES.checkup,
          badge: "20% off",
        },
        {
          id: "svc-sample",
          name: "Home sample pick-up",
          priceInr: 199,
          imageUrl: IMAGES.lab,
        },
        {
          id: "svc-video",
          name: "Video consult",
          priceInr: 399,
          imageUrl: IMAGES.consult,
          badge: "In 10 min",
        },
        {
          id: "svc-pharmacy",
          name: "Medicine delivery",
          priceInr: 0,
          imageUrl: IMAGES.medicine,
          badge: "Free",
        },
        {
          id: "svc-dental",
          name: "Dental cleaning",
          priceInr: 799,
          imageUrl: IMAGES.pharmacy,
        },
        {
          id: "svc-home",
          name: "Home physiotherapy",
          priceInr: 599,
          imageUrl: IMAGES.homeCare,
        },
      ],
    },
    {
      id: "sec-doctors",
      type: "doctor_carousel",
      title: "Doctors available today",
      background: { kind: "color", value: "#F4F7F6" },
      items: [
        { doctorId: "doc-ananya" },
        { doctorId: "doc-vikram" },
        { doctorId: "doc-fatima" },
        { doctorId: "doc-suresh" },
      ],
    },
    {
      id: "sec-offer",
      type: "offer_strip",
      title: "Offer",
      background: { kind: "color", value: "#FDF1DC" },
      items: [
        {
          id: "offer-1",
          message: "Free home sample collection on bills above ₹999",
          icon: "gift",
        },
      ],
    },
  ],
};

export const festivalConfig: LayoutConfig = {
  version: 4,
  theme: {
    primary: "#F0A22E",
    secondary: "#F6C453",
    accent: "#FB7185",
    background: "#171009",
    surface: "#241809",
    textPrimary: "#FFF6E6",
    textSecondary: "#E2C9A4",
    festival: {
      name: "Diwali",
      greeting: "Shubh Deepavali, Anjali",
      bannerImageUrl: IMAGES.diya,
    },
  },
  tabs: [
    { id: "tab-home", label: "Home", icon: "home", screen: "home" },
    { id: "tab-bookings", label: "Visits", icon: "calendar", screen: "bookings" },
    { id: "tab-rx", label: "Medicines", icon: "medkit", screen: "prescriptions" },
    { id: "tab-profile", label: "You", icon: "person", screen: "profile" },
  ],
  sections: [
    {
      id: "sec-hero-festival",
      type: "hero_banner",
      title: "Tapza Clinic, Jubilee Hills",
      background: { kind: "gradient", value: "#7C2D12,#B45309" },
      items: [
        {
          id: "hero-festival",
          imageUrl: IMAGES.diya,
          greeting: "Shubh Deepavali, Anjali",
          subtitle: "Celebrate with family. We'll take care of the check-ups.",
          ctaLabel: "See Diwali packages",
        },
      ],
    },
    {
      id: "sec-offer-festival",
      type: "offer_strip",
      title: "Diwali offer",
      background: { kind: "gradient", value: "#B45309,#9A3412" },
      items: [
        {
          id: "offer-festival",
          message: "25% off all health packages till 25 October",
          icon: "sparkles",
        },
      ],
    },
    {
      id: "sec-categories-festival",
      type: "category_chips",
      title: "Festive care",
      background: { kind: "color", value: "#171009" },
      items: [
        { id: "cat-sweets", label: "Sugar check", icon: "drop" },
        { id: "cat-family", label: "Family pack", icon: "people" },
        { id: "cat-lab", label: "Lab tests", icon: "flask" },
        { id: "cat-pharmacy", label: "Pharmacy", icon: "medkit" },
      ],
    },
    {
      id: "sec-services-festival",
      type: "service_grid",
      title: "Diwali health packages",
      background: { kind: "color", value: "#241809" },
      items: [
        {
          id: "svc-diwali-detox",
          name: "Festive detox panel",
          priceInr: 1299,
          imageUrl: IMAGES.lab,
          badge: "New",
        },
        {
          id: "svc-diwali-sugar",
          name: "Sugar & BP check",
          priceInr: 499,
          imageUrl: IMAGES.checkup,
          badge: "25% off",
        },
        {
          id: "svc-diwali-family",
          name: "Family health pack",
          priceInr: 3499,
          imageUrl: IMAGES.consult,
          badge: "4 people",
        },
        {
          id: "svc-diwali-dental",
          name: "Dental cleaning",
          priceInr: 699,
          imageUrl: IMAGES.pharmacy,
        },
      ],
    },
    {
      id: "sec-doctors-festival",
      type: "doctor_carousel",
      title: "Doctors on duty this week",
      background: { kind: "color", value: "#171009" },
      items: [
        { doctorId: "doc-ananya" },
        { doctorId: "doc-suresh" },
        { doctorId: "doc-priya" },
      ],
    },
    {
      id: "sec-quick-festival",
      type: "quick_actions",
      title: "Quick actions",
      // Proof that the third background kind works: photo band + derived overlay.
      background: { kind: "image", value: IMAGES.diya },
      items: [
        { id: "qa-book", label: "Book", icon: "calendar", target: "bookings" },
        { id: "qa-rx", label: "Prescriptions", icon: "document", target: "prescriptions" },
        { id: "qa-reminders", label: "Reminders", icon: "alarm", target: "prescriptions" },
      ],
    },
    {
      // Deliberately unknown to this build: proves unknown sections are skipped.
      id: "sec-scratch",
      type: "scratch_card",
      title: "Scratch and win",
      background: { kind: "color", value: "#241809" },
      items: [{ id: "scratch-1", prize: "₹500 off" }],
    },
  ],
};

export const configVariants = {
  normal: normalConfig,
  festival: festivalConfig,
} as const;

export type ConfigVariant = keyof typeof configVariants;
