import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme/ThemeProvider";
import { Icon } from "./Icon";

/**
 * Every remote image in the app goes through here. If the CDN is slow or the
 * config points at a dead URL, we show a calm placeholder instead of a broken
 * box — images come from remote config, so this path *will* happen eventually.
 */
export function RemoteImage({
  uri,
  style,
  contentFit = "cover",
  accessibilityLabel,
}: {
  uri?: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: "cover" | "contain";
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: theme.colors.skeleton },
        style,
      ]}
    >
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          transition={240}
          cachePolicy="memory-disk"
          accessibilityLabel={accessibilityLabel}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={styles.fallback}>
          <Icon name="image" size={22} color={theme.colors.textSecondary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  fallback: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
