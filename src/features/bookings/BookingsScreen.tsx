import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useDoctors } from "../../api/queries";
import { slotIdToTime } from "../../api/mock/handlers";
import { Icon } from "../../components/ui/Icon";
import { PressableScale } from "../../components/ui/PressableScale";
import { ScreenTitle } from "../../components/ui/ScreenTitle";
import { StateView } from "../../components/ui/StateView";
import { formatDate, formatTime } from "../../lib/format";
import { withAlpha } from "../../lib/color";
import type { TabNavigation } from "../../navigation/types";
import { useAppStore } from "../../store/useAppStore";
import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";

export function BookingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabNavigation>();
  const bookings = useAppStore((state) => state.bookings);
  const { data: doctors } = useDoctors();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: theme.spacing.huge,
          paddingHorizontal: theme.spacing.base,
          gap: theme.spacing.base,
        }}
      >
        <ScreenTitle
          title="Your visits"
          subtitle={bookings.length === 0 ? "Nothing booked yet" : `${bookings.length} upcoming`}
        />

        {bookings.length === 0 ? (
          <StateView
            tone="empty"
            icon="calendar"
            title="No visits booked"
            message="When you book a doctor or a service, your appointment will appear here."
            actionLabel="Book a visit"
            onAction={() => navigation.navigate("home")}
          />
        ) : (
          bookings.map((booking) => {
            const doctor = doctors?.find((entry) => entry.id === booking.doctorId);
            const datePart = booking.slotId.split("|")[1] ?? "";
            const time = slotIdToTime(booking.slotId);

            return (
              <View
                key={booking.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.lg,
                    padding: theme.spacing.base,
                    gap: theme.spacing.sm,
                  },
                ]}
              >
                <View style={styles.row}>
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    style={{
                      color: theme.colors.textPrimary,
                      fontSize: theme.fontSize.subtitle,
                      fontWeight: "700",
                      flex: 1,
                    }}
                  >
                    {doctor?.name ?? "Clinic visit"}
                  </Text>
                  <View
                    style={[
                      styles.status,
                      {
                        backgroundColor: withAlpha(theme.colors.success, 0.14),
                        borderRadius: theme.radius.pill,
                      },
                    ]}
                  >
                    <Icon name="check" size={12} color={theme.colors.success} />
                    <Text
                      maxFontSizeMultiplier={maxFontScale}
                      style={{
                        color: theme.colors.success,
                        fontSize: theme.fontSize.micro,
                        fontWeight: "700",
                      }}
                    >
                      Confirmed
                    </Text>
                  </View>
                </View>

                <Text
                  maxFontSizeMultiplier={maxFontScale}
                  style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.small }}
                >
                  {doctor?.specialty ?? "Tapza Clinic, Jubilee Hills"}
                </Text>

                <View style={[styles.metaRow, { gap: theme.spacing.base }]}>
                  <View style={[styles.meta, { gap: theme.spacing.xs }]}>
                    <Icon name="calendar" size={14} color={theme.colors.primary} />
                    <Text
                      maxFontSizeMultiplier={maxFontScale}
                      style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.caption }}
                    >
                      {formatDate(`${datePart}T00:00:00`)}
                    </Text>
                  </View>
                  {time ? (
                    <View style={[styles.meta, { gap: theme.spacing.xs }]}>
                      <Icon name="time" size={14} color={theme.colors.primary} />
                      <Text
                        maxFontSizeMultiplier={maxFontScale}
                        style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.caption }}
                      >
                        {formatTime(time)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`Book again with ${doctor?.name ?? "the clinic"}`}
                  onPress={() => navigation.navigate("home")}
                  style={[
                    styles.rebook,
                    {
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.md,
                      marginTop: theme.spacing.xs,
                    },
                  ]}
                >
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    style={{
                      color: theme.colors.primary,
                      fontSize: theme.fontSize.caption,
                      fontWeight: "700",
                    }}
                  >
                    Book again
                  </Text>
                </PressableScale>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rebook: {
    minHeight: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
