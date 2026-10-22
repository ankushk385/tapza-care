import { ensureContrast, isDark, readableOn, shade, withAlpha } from "../lib/color";
import type { ConfigTheme } from "../types/config";
import { fallbackPalette, fontSize, radius, spacing } from "./tokens";

export type ThemeMode = "light" | "dark";

export interface Palette {
  primary: string;
  primaryPressed: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  onPrimary: string;
  border: string;
  overlay: string;
  onOverlay: string;
  success: string;
  warning: string;
  danger: string;
  skeleton: string;
  mode: ThemeMode;
}

export interface AppTheme {
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
}

/**
 * Turns an untrusted config theme into a safe palette:
 * - borders/overlays are derived from `textPrimary`, not hard-coded
 * - text colours are pushed to WCAG AA against the background *and* surface
 * - `onPrimary` is chosen for contrast, so a pale festival primary still works
 */
export function buildTheme(configTheme?: ConfigTheme | null): AppTheme {
  const c = configTheme;
  const background = c?.background ?? fallbackPalette.background;
  const surface = c?.surface ?? fallbackPalette.surface;
  // 3:1 is the WCAG threshold for UI components (buttons, tab indicators).
  // A config that ships an invisible primary gets nudged to a readable one.
  const primary = ensureContrast(c?.primary ?? fallbackPalette.primary, background, 3);

  const safeText = (candidate: string, fallback: string): string => {
    const onBackground = ensureContrast(candidate || fallback, background);
    return onBackground;
  };

  let textPrimary = safeText(c?.textPrimary ?? fallbackPalette.textPrimary, fallbackPalette.textPrimary);
  if (ensureContrast(textPrimary, surface) !== textPrimary) {
    textPrimary = readableOn(surface);
  }

  const textSecondary = ensureContrast(
    c?.textSecondary ?? fallbackPalette.textSecondary,
    background,
    3.4,
  );

  const overlayBase = isDark(background) ? "#000000" : textPrimary;

  return {
    colors: {
      primary,
      primaryPressed: shade(primary, 0.86),
      secondary: c?.secondary ?? fallbackPalette.secondary,
      accent: c?.accent ?? fallbackPalette.accent,
      background,
      surface,
      textPrimary,
      textSecondary: ensureContrast(textSecondary, surface, 3.4),
      onPrimary: readableOn(primary),
      border: withAlpha(textPrimary, 0.12),
      overlay: withAlpha(overlayBase, 0.62),
      onOverlay: readableOn(overlayBase),
      success: fallbackPalette.success,
      warning: fallbackPalette.warning,
      danger: fallbackPalette.danger,
      skeleton: withAlpha(textPrimary, 0.08),
      mode: isDark(background) ? "dark" : "light",
    },
    spacing,
    radius,
    fontSize,
  };
}
