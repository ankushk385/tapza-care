/**
 * Small colour maths helpers. Used to derive borders, overlays and a readable
 * `onPrimary` from whatever the server sends, so a festival config can never
 * produce unreadable text.
 *
 * Pure white/black only appear here and in `tokens.ts` — never in components.
 */

type Rgb = { r: number; g: number; b: number };

const WHITE = "#FFFFFF";
const INK = "#0B1211";

export function hexToRgb(hex: string): Rgb | null {
  const value = hex.trim().replace("#", "");
  const expanded =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.45;
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

/** Returns `fg` when it already passes WCAG AA, otherwise picks the best of white/ink. */
export function ensureContrast(fg: string, bg: string, min = 4.5): string {
  if (contrastRatio(fg, bg) >= min) return fg;
  return contrastRatio(WHITE, bg) >= contrastRatio(INK, bg) ? WHITE : INK;
}

/** Darkens (amount < 1) or lightens (amount > 1) a hex colour. */
export function shade(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const to = (c: number) => clamp(amount < 1 ? c * amount : c + (255 - c) * (amount - 1));
  const part = (n: number) => n.toString(16).padStart(2, "0");
  return `#${part(to(rgb.r))}${part(to(rgb.g))}${part(to(rgb.b))}`;
}

export function readableOn(bg: string): string {
  return contrastRatio(WHITE, bg) >= contrastRatio(INK, bg) ? WHITE : INK;
}

/** Splits a config gradient value such as `#0F766E,#0EA5A0` into stops. */
export function gradientStops(value: string): string[] {
  const stops = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return stops.length >= 2 ? stops : ["#0F766E", "#0EA5A0"];
}
