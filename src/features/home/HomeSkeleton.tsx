import { StyleSheet, View } from "react-native";

import { Skeleton } from "../../components/ui/Skeleton";
import { useTheme } from "../../theme/ThemeProvider";

/**
 * Matches the real page's rhythm — hero, chip row, tiles, 3-up grid, doctor
 * cards — so the swap from skeleton to content doesn't shift the layout.
 */
export function HomeSkeleton({ topInset }: { topInset: number }) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel="Loading your clinic"
      style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: topInset + 64 }}
    >
      <View style={{ padding: theme.spacing.base, gap: theme.spacing.md }}>
        <Skeleton height={236} radius={theme.radius.xl} />
        <Skeleton width="52%" height={18} />
        <View style={[styles.row, { gap: theme.spacing.sm }]}>
          <Skeleton width={104} height={44} radius={theme.radius.pill} />
          <Skeleton width={92} height={44} radius={theme.radius.pill} />
          <Skeleton width={86} height={44} radius={theme.radius.pill} />
        </View>

        <View style={[styles.row, { gap: theme.spacing.sm }]}>
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} width={70} height={78} radius={theme.radius.md} />
          ))}
        </View>

        <Skeleton width="40%" height={18} />
        <View style={[styles.grid, { gap: theme.spacing.sm }]}>
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <View key={key} style={{ width: "31%", gap: 6 }}>
              <Skeleton height={84} radius={theme.radius.md} />
              <Skeleton height={11} />
              <Skeleton width="55%" height={11} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
