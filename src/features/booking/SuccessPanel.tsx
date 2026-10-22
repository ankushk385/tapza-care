import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { withAlpha } from "../../lib/color";
import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";

/**
 * Success animation: one springing disc plus a delayed fade-up, no Lottie file
 * and no JS-thread work. Cheap enough for a low-end Android and easy to explain.
 */
export function SuccessPanel({
  title,
  subtitle,
  onDone,
}: {
  title: string;
  subtitle: string;
  onDone: () => void;
}) {
  const theme = useTheme();
  const scale = useSharedValue(0.5);
  const progress = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    progress.value = withDelay(120, withTiming(1, { duration: 320 }));
  }, [progress, scale]);

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: progress.value,
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }],
  }));

  return (
    <View style={[styles.wrapper, { gap: theme.spacing.md, padding: theme.spacing.xl }]}>
      <Animated.View
        accessibilityLabel="Booking confirmed"
        style={[
          styles.disc,
          { backgroundColor: withAlpha(theme.colors.success, 0.14) },
          discStyle,
        ]}
      >
        <View
          style={[
            styles.innerDisc,
            { backgroundColor: theme.colors.success, borderColor: theme.colors.surface },
          ]}
        >
          <Icon name="check" size={30} color={theme.colors.onOverlay} />
        </View>
      </Animated.View>

      <Animated.View style={[{ alignItems: "center", gap: 6 }, copyStyle]}>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.fontSize.title,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          {title}
        </Text>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSize.small,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          {subtitle}
        </Text>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSize.caption,
            textAlign: "center",
            lineHeight: 18,
            marginTop: 4,
          }}
        >
          We&apos;ll send the clinic details on WhatsApp.
        </Text>
      </Animated.View>

      <Button label="Done" onPress={onDone} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  disc: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  innerDisc: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
