import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

/** The four screens the config is allowed to point a tab at. */
export type TabParamList = {
  home: undefined;
  bookings: undefined;
  prescriptions: undefined;
  profile: undefined;
};

export type TabNavigation = BottomTabNavigationProp<TabParamList>;

/** Nested stack inside the prescriptions tab. */
export type PrescriptionsStackParamList = {
  PrescriptionsList: undefined;
  PrescriptionDetail: { id: string };
};
