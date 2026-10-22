import React, { createContext, useContext, useMemo } from "react";

import type { ConfigTheme } from "../types/config";
import { buildTheme, type AppTheme } from "./buildTheme";

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({
  configTheme,
  children,
}: {
  configTheme?: ConfigTheme | null;
  children: React.ReactNode;
}) {
  const value = useMemo(() => buildTheme(configTheme), [configTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return theme;
}

/**
 * Builds a StyleSheet once per theme change instead of on every render.
 * The factory must be declared at module scope so its identity is stable.
 */
export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
