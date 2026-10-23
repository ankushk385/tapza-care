import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { RemoteImage } from "../../../components/ui/RemoteImage";
import { PressableScale } from "../../../components/ui/PressableScale";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { formatRupees } from "../../../lib/format";
import { readableOn } from "../../../lib/color";
import { componentSize, maxFontScale } from "../../../theme/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { serviceItemSchema, type HomeSection } from "../../../types/config";
import { useBandPalette } from "../band";

const COLUMNS = 3;

/**
 * 2–3 column grid. The card width is computed from the window instead of using
 * percentages, so the grid stays exact at every font scale and screen width.
 */
export function ServiceGrid({
  section,
  onBook,
}: {
  section: HomeSection;
  onBook: (name: string, priceInr: number, imageUrl?: string) => void;
}) {
  const theme = useTheme();
  const band = useBandPalette();
  const { width } = useWindowDimensions();

  const items = section.items.flatMap((raw) => {
    const parsed = serviceItemSchema.safeParse(raw);
    return parsed.success ? [parsed.data] : [];
  });

  if (items.length === 0) return null;

  const gap = theme.spacing.sm;
  const available = width - theme.spacing.base * 2;
  const cardWidth = Math.floor((available - gap * (COLUMNS - 1)) / COLUMNS);

  return (
    <View style={{ gap: theme.spacing.md }}>
      <SectionHeader title={section.title} />
      <View style={[styles.grid, { gap }]}>
        {items.map((item) => (
          <PressableScale
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${formatRupees(item.priceInr)}`}
            onPress={() => onBook(item.name, item.priceInr, item.imageUrl)}
            style={{ width: cardWidth, gap: theme.spacing.xs }}
          >
            <View style={[styles.imageWrap, { borderRadius: theme.radius.md }]}>
              <RemoteImage
                uri={item.imageUrl}
                style={{ width: "100%", height: componentSize.serviceImageHeight }}
              />
              {item.badge ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: band.accent,
                      borderRadius: theme.radius.pill,
                      paddingHorizontal: theme.spacing.xs + 2,
                      paddingVertical: 2,
                    },
                  ]}
                >
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    numberOfLines={1}
                    style={{
                      color: readableOn(band.accent),
                      fontSize: theme.fontSize.micro,
                      fontWeight: "700",
                    }}
                  >
                    {item.badge}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              maxFontSizeMultiplier={maxFontScale}
              numberOfLines={2}
              style={[
                styles.name,
                { color: band.text, fontSize: theme.fontSize.caption },
              ]}
            >
              {item.name}
            </Text>
            <Text
              maxFontSizeMultiplier={maxFontScale}
              style={{
                color: item.priceInr === 0 ? band.accent : band.muted,
                fontSize: theme.fontSize.caption,
                fontWeight: "700",
              }}
            >
              {formatRupees(item.priceInr)}
            </Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageWrap: {
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
  },
  name: {
    fontWeight: "600",
    lineHeight: 16,
    minHeight: 32,
  },
});
