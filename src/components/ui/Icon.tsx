import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

/**
 * Icons arrive from the config as strings, so the app maps a fixed whitelist of
 * names to real glyphs. An unknown name falls back to a neutral dot: dynamic
 * names can never crash a renderer or break an OTA build.
 */
const GLYPHS = {
  home: "home-outline",
  calendar: "calendar-outline",
  medkit: "medkit-outline",
  person: "person-outline",
  stethoscope: "pulse-outline",
  flask: "flask-outline",
  shield: "shield-checkmark-outline",
  document: "document-text-outline",
  alarm: "alarm-outline",
  people: "people-outline",
  gift: "gift-outline",
  sparkles: "sparkles-outline",
  drop: "water-outline",
  image: "image-outline",
  refresh: "refresh-outline",
  warning: "warning-outline",
  check: "checkmark",
  close: "close",
  time: "time-outline",
  chevron: "chevron-forward",
  back: "arrow-back",
  offline: "cloud-offline-outline",
  sun: "sunny-outline",
  afternoon: "partly-sunny-outline",
  moon: "moon-outline",
  call: "call-outline",
  location: "location-outline",
  star: "star-outline",
  cash: "cash-outline",
  card: "card-outline",
  bug: "bug-outline",
  contrast: "contrast-outline",
  hourglass: "hourglass-outline",
  whatsapp: "logo-whatsapp",
  empty: "ellipse-outline",
} as const satisfies Record<string, ComponentProps<typeof Ionicons>["name"]>;

export type IconName = keyof typeof GLYPHS;

export function Icon({
  name,
  size = 20,
  color,
}: {
  name: string;
  size?: number;
  color: string;
}) {
  const glyph = (GLYPHS as Record<string, ComponentProps<typeof Ionicons>["name"]>)[name];
  return <Ionicons name={glyph ?? "ellipse-outline"} size={size} color={color} />;
}
