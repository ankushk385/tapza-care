import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { maxFontScale, minTapTarget } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";

type Variant = "primary" | "secondary" | "ghost" | "danger";

/**
 * One button for the whole app: 48pt tall by default (above the 44pt minimum),
 * honours OS font scaling up to 1.4x, and always exposes a label for screen
 * readers even when only an icon is visible.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  compact = false,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const background =
    variant === "primary"
      ? theme.colors.primary
      : variant === "danger"
        ? theme.colors.danger
        : variant === "secondary"
          ? theme.colors.surface
          : "transparent";

  const foreground =
    variant === "primary"
      ? theme.colors.onPrimary
      : variant === "danger"
        ? theme.colors.onOverlay
        : theme.colors.primary;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: background,
          borderColor: variant === "secondary" ? theme.colors.border : "transparent",
          borderWidth: variant === "secondary" ? 1 : 0,
          minHeight: compact ? minTapTarget : 52,
          paddingHorizontal: compact ? theme.spacing.base : theme.spacing.xl,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <View style={[styles.content, { gap: theme.spacing.sm }]}>
          {icon ? <Icon name={icon} size={18} color={foreground} /> : null}
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={[styles.label, { color: foreground, fontSize: theme.fontSize.body }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
