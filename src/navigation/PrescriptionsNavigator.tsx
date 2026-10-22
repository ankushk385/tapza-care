import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { PrescriptionDetailScreen } from "../features/prescriptions/PrescriptionDetailScreen";
import { PrescriptionsScreen } from "../features/prescriptions/PrescriptionsScreen";
import { useTheme } from "../theme/ThemeProvider";
import type { PrescriptionsStackParamList } from "./types";

const Stack = createNativeStackNavigator<PrescriptionsStackParamList>();

export function PrescriptionsNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: theme.fontSize.body, fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="PrescriptionsList"
        component={PrescriptionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrescriptionDetail"
        component={PrescriptionDetailScreen}
        options={{ title: "Prescription", headerBackTitle: "Back" }}
      />
    </Stack.Navigator>
  );
}
