import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NavigatorScreenParams } from "@react-navigation/native";

/** The four screens the config is allowed to point a tab at. */
export type TabParamList = {
  home: { doctorId?: string } | undefined;
  bookings: undefined;
  prescriptions: NavigatorScreenParams<PrescriptionsStackParamList> | undefined;
  profile: undefined;
};

export type TabNavigation = BottomTabNavigationProp<TabParamList>;

/** Nested stack inside the prescriptions tab. */
export type PrescriptionsStackParamList = {
  PrescriptionsList: undefined;
  PrescriptionDetail: { id: string };
};
