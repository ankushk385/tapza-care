import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useConfig } from "./src/api/queries";
import { Icon } from "./src/components/ui/Icon";
import { StateView } from "./src/components/ui/StateView";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { useAppStore } from "./src/store/useAppStore";
import { ThemeProvider, useTheme } from "./src/theme/ThemeProvider";
import type { LayoutConfig } from "./src/types/config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ConfigGate />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * The only place that knows about "the app shell": fetch config → theme it →
 * mount navigation. When the variant changes we keep rendering the previous
 * config until the new one arrives, so a festival switch never flashes a blank
 * screen.
 */
function ConfigGate() {
  const variant = useAppStore((state) => state.variant);
  const { config, isLoading, refetch } = useConfig(variant);
  const [lastConfig, setLastConfig] = useState<LayoutConfig | null>(null);

  useEffect(() => {
    if (config) setLastConfig(config);
  }, [config]);

  const effective = config ?? lastConfig;

  return (
    <ThemeProvider configTheme={effective?.theme}>
      <AppBody config={effective} isLoading={isLoading} onRetry={() => void refetch()} />
    </ThemeProvider>
  );
}

function AppBody({
  config,
  isLoading,
  onRetry,
}: {
  config: LayoutConfig | null;
  isLoading: boolean;
  onRetry: () => void;
}) {
  const theme = useTheme();

  const navigationTheme = useMemo<NavigationTheme>(() => {
    const base = theme.colors.mode === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.accent,
      },
    };
  }, [theme]);

  if (!config) {
    return (
      <View style={[styles.fill, styles.boot, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.mark, { backgroundColor: theme.colors.primary }]}>
          <Icon name="stethoscope" size={26} color={theme.colors.onPrimary} />
        </View>
        <Text style={[styles.wordmark, { color: theme.colors.textPrimary }]}>Tapza Care</Text>

        {isLoading ? (
          <>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={[styles.bootText, { color: theme.colors.textSecondary }]}>
              Loading your clinic…
            </Text>
          </>
        ) : (
          <StateView
            tone="error"
            icon="offline"
            title="Can't reach the clinic"
            message="We couldn't load the app layout and nothing is saved on this device yet."
            actionLabel="Try again"
            onAction={onRetry}
          />
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme.colors.mode === "dark" ? "light" : "dark"} />
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator config={config} />
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  boot: {
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  bootText: {
    fontSize: 13,
  },
});
