import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/ui/Icon";
import { PressableScale } from "../../../components/ui/PressableScale";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { withAlpha } from "../../../lib/color";
import { maxFontScale, minTapTarget } from "../../../theme/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { quickActionItemSchema, type HomeSection, type TabTarget } from "../../../types/config";
import { useBandPalette } from "../band";

/**
 * Icon tiles. They are navigation, not bookings, which is why they get their
 * own renderer rather than reusing the service grid.
 */
export function QuickActions({
  section,
  onNavigate,
}: {
  section: HomeSection;
  onNavigate: (tab: TabTarget) => void;
}) {
  const theme = useTheme();
  const band = useBandPalette();

  const items = section.items.flatMap((raw) => {
    const parsed = quickActionItemSchema.safeParse(raw);
    return parsed.success ? [parsed.data] : [];
  });

  if (items.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <SectionHeader title={section.title} />
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        {items.map((item) => (
          <PressableScale
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => item.target && onNavigate(item.target)}
            style={[
              styles.tile,
              {
                backgroundColor: band.card,
                borderColor: band.border,
                borderRadius: theme.radius.md,
                paddingVertical: theme.spacing.md,
                gap: theme.spacing.sm,
                minHeight: minTapTarget,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: withAlpha(band.accent, 0.14), borderRadius: theme.radius.pill },
              ]}
            >
              <Icon name={item.icon ?? "empty"} size={20} color={band.accent} />
            </View>
            <Text
              maxFontSizeMultiplier={maxFontScale}
              numberOfLines={2}
              style={[
                styles.label,
                { color: band.text, fontSize: theme.fontSize.caption },
              ]}
            >
              {item.label}
            </Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tile: {
    flexBasis: "22%",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
    maxWidth: "25%",
  },
  iconCircle: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
});
