import { festivalConfig, normalConfig } from "../api/mock/configs";
import { contrastRatio } from "../lib/color";
import { buildTheme } from "./buildTheme";

describe("buildTheme", () => {
  it("keeps the shipped themes on brand", () => {
    const normal = buildTheme(normalConfig.theme);
    expect(normal.colors.primary).toBe("#0E7C6B");
    expect(normal.colors.mode).toBe("light");

    const festival = buildTheme(festivalConfig.theme);
    expect(festival.colors.primary).toBe("#F0A22E");
    expect(festival.colors.mode).toBe("dark");
  });

  it("rescues a hostile config with pale primary and washed-out text", () => {
    const theme = buildTheme({
      primary: "#F4F7F6",
      secondary: "#F4F7F6",
      background: "#F4F7F6",
      surface: "#F4F7F6",
      textPrimary: "#F0F2F1",
      textSecondary: "#F2F4F3",
      accent: "#F4F7F6",
      festival: null,
    });
    const { colors } = theme;

    expect(contrastRatio(colors.primary, colors.background)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(colors.textPrimary, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.textPrimary, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.textSecondary, colors.surface)).toBeGreaterThanOrEqual(3);
  });

  it("falls back to a readable light theme when the config has none", () => {
    const theme = buildTheme(null);

    expect(theme.colors.mode).toBe("light");
    expect(contrastRatio(theme.colors.textPrimary, theme.colors.background)).toBeGreaterThan(7);
    // Derived from the palette, never a literal in a component.
    expect(theme.colors.border).toMatch(/^rgba\(/);
    expect(theme.colors.overlay).toMatch(/^rgba\(/);
  });
});
