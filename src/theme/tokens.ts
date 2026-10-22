/**
 * The only file in the app allowed to contain raw colour literals.
 * Everything else reads colours from `useTheme()`.
 */

export const fallbackPalette = {
  primary: "#0F766E",
  primaryDeep: "#0B5A54",
  secondary: "#14B8A6",
  accent: "#F59E0B",
  background: "#F5F8F7",
  surface: "#FFFFFF",
  textPrimary: "#0E1F1C",
  textSecondary: "#5A6B68",
  onPrimary: "#FFFFFF",
  border: "rgba(14, 31, 28, 0.10)",
  overlay: "rgba(6, 24, 22, 0.55)",
  success: "#128C63",
  warning: "#B45309",
  danger: "#B42318",
  skeleton: "rgba(14, 31, 28, 0.07)",
  /** Neutral base behind photos; also used to judge contrast over image bands. */
  scrim: "#0B1211",
} as const;

/** 4pt spacing scale. Every margin/padding in the app comes from here. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/** Type scale. Sizes are multiplied by the OS font scale at render time. */
export const fontSize = {
  micro: 10,
  caption: 12,
  small: 13,
  body: 15,
  subtitle: 17,
  title: 20,
  h2: 24,
  h1: 30,
} as const;

export const durations = {
  fast: 160,
  base: 240,
  slow: 420,
  enter: 520,
} as const;

/** Android/iOS accessibility minimum. */
export const minTapTarget = 44;

export const maxFontScale = 1.4;
