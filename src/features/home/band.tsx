import { createContext, useContext, useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { RemoteImage } from "../../components/ui/RemoteImage";
import { ensureContrast, gradientStops, isDark, readableOn, withAlpha } from "../../lib/color";
import { useTheme } from "../../theme/ThemeProvider";
import { fallbackPalette } from "../../theme/tokens";
import type { SectionBackground } from "../../types/config";

export interface BandPalette {
  base: string;
  isDark: boolean;
  text: string;
  muted: string;
  accent: string;
  card: string;
  border: string;
}

const BandContext = createContext<BandPalette | null>(null);

function buildBandPalette(
  theme: ReturnType<typeof useTheme>,
  background: SectionBackground,
): BandPalette {
  const base =
    background.kind === "gradient"
      ? (gradientStops(background.value)[0] ?? theme.colors.background)
      : background.kind === "image"
        ? fallbackPalette.scrim
        : background.value;

  const dark = isDark(base);
  const onBase = readableOn(base);

  return {
    base,
    isDark: dark,
    text: ensureContrast(theme.colors.textPrimary, base),
    muted: ensureContrast(theme.colors.textSecondary, base, 3.2),
    accent: ensureContrast(theme.colors.primary, base, 3),
    card: dark ? withAlpha(onBase, 0.08) : theme.colors.surface,
    border: withAlpha(onBase, 0.14),
  };
}

/** Text/card colours that are guaranteed readable on this band's background. */
export function useBandPalette(): BandPalette {
  const theme = useTheme();
  const band = useContext(BandContext);
  return useMemo(
    () =>
      band ??
      buildBandPalette(theme, { kind: "color", value: theme.colors.background }),
    [band, theme],
  );
}

/**
 * The visual signature of the brief: every section is a full-bleed band with
 * its own background, so the home reads as distinct strips while scrolling.
 */
export function SectionBand({
  background,
  children,
  style,
}: {
  background: SectionBackground;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const palette = useMemo(() => buildBandPalette(theme, background), [theme, background]);
  const stops = useMemo(() => gradientStops(background.value), [background.value]);

  return (
    <View style={[{ backgroundColor: background.kind === "color" ? background.value : palette.base }, style]}>
      {background.kind === "gradient" ? (
        <LinearGradient
          colors={stops as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {background.kind === "image" ? (
        <>
          <RemoteImage uri={background.value} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]} />
        </>
      ) : null}

      <BandContext.Provider value={palette}>
        <View
          style={{
            paddingVertical: theme.spacing.xl,
            paddingHorizontal: theme.spacing.base,
            gap: theme.spacing.md,
          }}
        >
          {children}
        </View>
      </BandContext.Provider>
    </View>
  );
}
