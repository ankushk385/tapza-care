import { StyleSheet, Text, View } from "react-native";

import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { useBandPalette } from "../../features/home/band";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  inverted = false,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  inverted?: boolean;
}) {
  const theme = useTheme();
  const band = useBandPalette();
  const titleColor = inverted ? theme.colors.onOverlay : band.text;
  const actionColor = inverted ? theme.colors.onOverlay : band.accent;

  if (!title && !actionLabel) return null;

  return (
    <View style={styles.row}>
      <Text
        accessibilityRole="header"
        maxFontSizeMultiplier={maxFontScale}
        numberOfLines={2}
        style={[styles.title, { color: titleColor, fontSize: theme.fontSize.subtitle }]}
      >
        {title}
      </Text>

      {actionLabel && onAction ? (
        <PressableScale
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={8}
          style={[styles.action, { gap: theme.spacing.xs }]}
        >
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={{ color: actionColor, fontSize: theme.fontSize.small, fontWeight: "600" }}
          >
            {actionLabel}
          </Text>
          <Icon name="chevron" size={13} color={actionColor} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flexShrink: 1,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 32,
  },
});
