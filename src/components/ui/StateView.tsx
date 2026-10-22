import { StyleSheet, Text, View } from "react-native";

import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "./Button";
import { Icon } from "./Icon";

/**
 * Empty and error states are designed, not bolted on: same illustration slot,
 * same copy rhythm, one clear action. Used by every list in the app.
 */
export function StateView({
  tone,
  icon,
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
}: {
  tone: "empty" | "error";
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  const theme = useTheme();
  const tint = tone === "error" ? theme.colors.danger : theme.colors.primary;

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingVertical: compact ? theme.spacing.xl : theme.spacing.huge,
          gap: theme.spacing.md,
        },
      ]}
      accessibilityRole="summary"
    >
      <View style={[styles.badge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Icon name={icon} size={compact ? 20 : 26} color={tint} />
      </View>
      <Text
        maxFontSizeMultiplier={maxFontScale}
        style={[styles.title, { color: theme.colors.textPrimary, fontSize: theme.fontSize.subtitle }]}
      >
        {title}
      </Text>
      <Text
        maxFontSizeMultiplier={maxFontScale}
        style={[styles.message, { color: theme.colors.textSecondary, fontSize: theme.fontSize.small }]}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} compact icon="refresh" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 20,
  },
  action: {
    marginTop: 4,
  },
});
