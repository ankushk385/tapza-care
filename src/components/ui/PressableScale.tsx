import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "../../theme/ThemeProvider";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Press feedback on the UI thread: a 2% scale that costs nothing, plus the
 * platform ripple on Android. Keeps taps feeling alive on cheap devices.
 */
export function PressableScale({
  children,
  style,
  disabled,
  ...rest
}: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        scale.value = withTiming(0.97, { duration: 110 });
        rest.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 140 });
        rest.onPressOut?.(event);
      }}
      android_ripple={{ color: theme.colors.border, borderless: false }}
      style={[style, animatedStyle, disabled ? { opacity: 0.55 } : null]}
    >
      {children}
    </AnimatedPressable>
  );
}
