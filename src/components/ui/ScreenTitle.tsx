import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";

export function ScreenTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { gap: theme.spacing.md }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          accessibilityRole="header"
          maxFontSizeMultiplier={maxFontScale}
          style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.h2, fontWeight: "800", letterSpacing: -0.4 }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.small }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
