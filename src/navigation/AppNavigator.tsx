import type { ComponentType } from "react";
import { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Icon } from "../components/ui/Icon";
import { BookingsScreen } from "../features/bookings/BookingsScreen";
import { HomeScreen } from "../features/home/HomeScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { useTheme } from "../theme/ThemeProvider";
import type { ConfigTab, LayoutConfig, TabTarget } from "../types/config";
import { PrescriptionsNavigator } from "./PrescriptionsNavigator";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const SCREENS: Record<TabTarget, ComponentType<Record<string, unknown>>> = {
  home: HomeScreen as ComponentType<Record<string, unknown>>,
  bookings: BookingsScreen as ComponentType<Record<string, unknown>>,
  prescriptions: PrescriptionsNavigator as ComponentType<Record<string, unknown>>,
  profile: ProfileScreen as ComponentType<Record<string, unknown>>,
};

const FALLBACK_TABS: ConfigTab[] = [
  { id: "fallback-home", label: "Home", icon: "home", screen: "home" },
  { id: "fallback-bookings", label: "Bookings", icon: "calendar", screen: "bookings" },
  { id: "fallback-rx", label: "Medicines", icon: "medkit", screen: "prescriptions" },
  { id: "fallback-profile", label: "Profile", icon: "person", screen: "profile" },
];

function normaliseTabs(tabs: ConfigTab[]): ConfigTab[] {
  const seen = new Set<TabTarget>();
  const unique = tabs.filter((tab) => {
    if (seen.has(tab.screen)) return false;
    seen.add(tab.screen);
    return true;
  });
  return unique.length > 0 ? unique : FALLBACK_TABS;
}

/**
 * Tabs are built from `config.tabs`, not from a static navigator. The config
 * controls order, labels, icons and which screens exist — so switching to the
 * festival payload re-brands the tab bar without a rebuild.
 */
export function AppNavigator({ config }: { config: LayoutConfig }) {
  const theme = useTheme();
  const tabs = useMemo(() => normaliseTabs(config.tabs), [config.tabs]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.micro,
          fontWeight: "600",
        },
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.screen}
          name={tab.screen}
          component={SCREENS[tab.screen]}
          options={{
            title: tab.label,
            tabBarAccessibilityLabel: tab.label,
            tabBarIcon: ({ color, size }) => <Icon name={tab.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
