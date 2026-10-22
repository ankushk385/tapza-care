import type { ReactNode } from "react";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

/**
 * Fade + rise as the section enters the viewport.
 *
 * Each section reports its own y offset with `onLayout`; the parent owns a
 * single scroll shared value. One scroll handler drives every band, which is
 * why this stays smooth on a mid-range Android instead of triggering a JS
 * render per pixel.
 */
export function AnimatedSection({
  scrollY,
  viewportHeight,
  children,
}: {
  scrollY: SharedValue<number>;
  viewportHeight: number;
  children: ReactNode;
}) {
  const offsetY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const start = offsetY.value - viewportHeight * 0.95;
    const end = offsetY.value - viewportHeight * 0.55;
    const progress = interpolate(
      scrollY.value,
      [start, end],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: progress,
      transform: [{ translateY: (1 - progress) * 26 }],
    };
  });

  return (
    <Animated.View
      onLayout={(event) => {
        offsetY.value = event.nativeEvent.layout.y;
      }}
      style={animatedStyle}
    >
      {children}
    </Animated.View>
  );
}
