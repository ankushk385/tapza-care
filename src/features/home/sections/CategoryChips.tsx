import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/ui/Icon";
import { PressableScale } from "../../../components/ui/PressableScale";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { withAlpha } from "../../../lib/color";
import { maxFontScale } from "../../../theme/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { chipItemSchema, type HomeSection } from "../../../types/config";
import { useBandPalette } from "../band";

/** Horizontally scrolling category chips. Bleeds to the screen edge on purpose. */
export function CategoryChips({
  section,
  onPress,
}: {
  section: HomeSection;
  onPress: (label: string) => void;
}) {
  const theme = useTheme();
  const band = useBandPalette();

  const items = section.items.flatMap((raw) => {
    const parsed = chipItemSchema.safeParse(raw);
    return parsed.success ? [parsed.data] : [];
  });

  if (items.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <SectionHeader title={section.title} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -theme.spacing.base }}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.base,
          gap: theme.spacing.sm,
        }}
      >
        {items.map((item) => (
          <PressableScale
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => onPress(item.label)}
            style={[
              styles.chip,
              {
                backgroundColor: band.card,
                borderColor: band.border,
                borderRadius: theme.radius.pill,
                minHeight: 44,
                paddingHorizontal: theme.spacing.md,
                gap: theme.spacing.sm,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: withAlpha(band.accent, 0.14),
                  borderRadius: theme.radius.pill,
                },
              ]}
            >
              <Icon name={item.icon ?? "empty"} size={15} color={band.accent} />
            </View>
            <Text
              maxFontSizeMultiplier={maxFontScale}
              numberOfLines={1}
              style={{
                color: band.text,
                fontSize: theme.fontSize.small,
                fontWeight: "600",
              }}
            >
              {item.label}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
});
