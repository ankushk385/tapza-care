import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { RemoteImage } from "../../../components/ui/RemoteImage";
import { PressableScale } from "../../../components/ui/PressableScale";
import { readableOn, withAlpha } from "../../../lib/color";
import { maxFontScale } from "../../../theme/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { heroItemSchema, type HomeSection } from "../../../types/config";
import { useBandPalette } from "../band";

/**
 * Parallax hero: the photo moves slower than the page, the copy stays put.
 * `scrollY` is a Reanimated shared value, so this runs on the UI thread.
 */
export function HeroBanner({
  section,
  scrollY,
  onBook,
}: {
  section: HomeSection;
  scrollY: SharedValue<number>;
  onBook: (label: string) => void;
}) {
  const theme = useTheme();
  const band = useBandPalette();
  const parsed = heroItemSchema.safeParse(section.items[0]);
  const item = parsed.success ? parsed.data : null;

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [-240, 0, 420], [-40, 0, 120], Extrapolation.CLAMP),
      },
      { scale: 1.12 },
    ],
  }));

  return (
    <View
      style={[
        styles.card,
        { borderRadius: theme.radius.xl, borderColor: band.border, backgroundColor: band.card },
      ]}
    >
      {item?.imageUrl ? (
        <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
          <RemoteImage uri={item.imageUrl} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}

      <LinearGradient
        colors={["transparent", theme.colors.overlay]}
        locations={[0.25, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { gap: theme.spacing.sm }]}>
        <View style={[styles.eyebrow, { borderColor: withAlpha(theme.colors.onOverlay, 0.35) }]}>
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={[styles.eyebrowText, { color: theme.colors.onOverlay, fontSize: theme.fontSize.caption }]}
            numberOfLines={1}
          >
            {section.title}
          </Text>
        </View>

        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={[styles.greeting, { color: theme.colors.onOverlay, fontSize: theme.fontSize.h2 }]}
          numberOfLines={2}
        >
          {item?.greeting ?? "Namaste"}
        </Text>

        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={[styles.subtitle, { color: theme.colors.onOverlay, fontSize: theme.fontSize.small }]}
          numberOfLines={2}
        >
          {item?.subtitle ?? ""}
        </Text>

        <PressableScale
          accessibilityRole="button"
          onPress={() => onBook(item?.ctaLabel ?? "Book a visit")}
          style={[
            styles.cta,
            { backgroundColor: theme.colors.onOverlay, borderRadius: theme.radius.pill },
          ]}
        >
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={[styles.ctaText, { color: readableOn(theme.colors.onOverlay), fontSize: theme.fontSize.small }]}
          >
            {item?.ctaLabel ?? "Book a visit"}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 236,
    overflow: "hidden",
    borderWidth: 1,
    justifyContent: "flex-end",
  },
  content: {
    padding: 18,
    paddingTop: 44,
  },
  eyebrow: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 2,
    maxWidth: "100%",
  },
  eyebrowText: {
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  greeting: {
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    opacity: 0.92,
    lineHeight: 20,
    maxWidth: "92%",
  },
  cta: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  ctaText: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
