import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { Icon } from "../../components/ui/Icon";
import { PressableScale } from "../../components/ui/PressableScale";
import { withAlpha } from "../../lib/color";
import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import type { LayoutConfig } from "../../types/config";

/**
 * Collapsing header. At rest it is a large wordmark; after ~70pt of scroll it
 * cross-fades into a compact bar with a solid background. One shared value,
 * two interpolations, zero JS re-renders.
 */
export function HomeHeader({
  config,
  scrollY,
  topInset,
  onLongPressTitle,
}: {
  config: LayoutConfig;
  scrollY: SharedValue<number>;
  topInset: number;
  onLongPressTitle: () => void;
}) {
  const theme = useTheme();
  const festival = config.theme.festival;

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [40, 110], [0, 1], Extrapolation.CLAMP),
  }));

  const largeStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [0, 70], [1, 0], Extrapolation.CLAMP);
    return {
      opacity: progress,
      transform: [{ translateY: (1 - progress) * -12 }],
    };
  });

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [50, 110], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { height: topInset + 64, paddingTop: topInset }]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
          backgroundStyle,
        ]}
      />

      <Animated.View style={[styles.large, largeStyle]}>
        <PressableScale
          accessibilityRole="header"
          accessibilityLabel="Tapza Care"
          onLongPress={onLongPressTitle}
          delayLongPress={450}
          style={styles.largeTextBlock}
        >
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={[styles.wordmark, { color: theme.colors.textPrimary, fontSize: theme.fontSize.h2 }]}
            numberOfLines={1}
          >
            Tapza Care
          </Text>
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }}
            numberOfLines={1}
          >
            Jubilee Hills · Hyderabad
          </Text>
        </PressableScale>

        {festival ? (
          <View
            style={[
              styles.pill,
              {
                backgroundColor: withAlpha(theme.colors.accent, 0.16),
                borderColor: withAlpha(theme.colors.accent, 0.35),
                borderRadius: theme.radius.pill,
                gap: theme.spacing.xs,
              },
            ]}
          >
            <Icon name="sparkles" size={13} color={theme.colors.accent} />
            <Text
              maxFontSizeMultiplier={maxFontScale}
              style={{
                color: theme.colors.accent,
                fontSize: theme.fontSize.caption,
                fontWeight: "700",
              }}
              numberOfLines={1}
            >
              {festival.name}
            </Text>
          </View>
        ) : null}
      </Animated.View>

      <Animated.View style={[styles.compact, compactStyle]}>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          numberOfLines={1}
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSize.body,
            fontWeight: "700",
          }}
        >
          Tapza Care
        </Text>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          numberOfLines={1}
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSize.caption,
          }}
        >
          {festival ? `${festival.name} edition` : "Jubilee Hills"}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    paddingHorizontal: 16,
    zIndex: 20,
  },
  large: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  largeTextBlock: {
    flexShrink: 1,
  },
  wordmark: {
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  compact: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 10,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
});
