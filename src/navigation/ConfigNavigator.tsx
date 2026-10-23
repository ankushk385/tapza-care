import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ConfigEditorScreen } from "../features/profile/ConfigEditorScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";

export type ConfigStackParamList = {
  ProfileRoot: undefined;
  configStudio: undefined;
};

const Stack = createNativeStackNavigator<ConfigStackParamList>();

export function ConfigNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileRoot" component={ProfileScreen} />
      <Stack.Screen name="configStudio" component={ConfigEditorScreen} />
    </Stack.Navigator>
  );
}
