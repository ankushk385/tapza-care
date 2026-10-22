import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/ui/Icon";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { maxFontScale } from "../../../theme/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { offerItemSchema, type HomeSection } from "../../../types/config";
import { useBandPalette } from "../band";

export function OfferStrip({ section }: { section: HomeSection }) {
  const theme = useTheme();
  const band = useBandPalette();

  const items = section.items.flatMap((raw) => {
    const parsed = offerItemSchema.safeParse(raw);
    return parsed.success ? [parsed.data] : [];
  });

  const message = items[0]?.message ?? section.title;
  if (!message) return null;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      {section.title && items[0]?.message ? <SectionHeader title={section.title} /> : null}
      <View
        style={[
          styles.strip,
          {
            backgroundColor: band.card,
            borderColor: band.border,
            borderRadius: theme.radius.md,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
            gap: theme.spacing.md,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: band.card, borderColor: band.border, borderRadius: theme.radius.pill },
          ]}
        >
          <Icon name={items[0]?.icon ?? "gift"} size={17} color={band.accent} />
        </View>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={[styles.message, { color: band.text, fontSize: theme.fontSize.small }]}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
    fontWeight: "600",
    lineHeight: 20,
  },
});
