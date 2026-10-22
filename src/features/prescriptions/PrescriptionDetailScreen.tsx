import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { usePrescriptions } from "../../api/queries";
import { Icon } from "../../components/ui/Icon";
import { PressableScale } from "../../components/ui/PressableScale";
import { Skeleton } from "../../components/ui/Skeleton";
import { StateView } from "../../components/ui/StateView";
import { formatDate, todayISO } from "../../lib/format";
import { withAlpha } from "../../lib/color";
import type { PrescriptionsStackParamList } from "../../navigation/types";
import { doseKey, useAppStore } from "../../store/useAppStore";
import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import type { DoseTiming, Medicine } from "../../types/config";

const SCHEDULE: { timing: DoseTiming; label: string; icon: string }[] = [
  { timing: "morning", label: "Morning", icon: "sun" },
  { timing: "afternoon", label: "Afternoon", icon: "afternoon" },
  { timing: "night", label: "Night", icon: "moon" },
];

/**
 * Prescription detail as a morning / afternoon / night schedule. Each dose is a
 * 44pt+ row with a real checkbox role, and ticks persist per day in the store.
 */
export function PrescriptionDetailScreen() {
  const theme = useTheme();
  const route = useRoute<RouteProp<PrescriptionsStackParamList, "PrescriptionDetail">>();
  const { data, isLoading } = usePrescriptions();

  const takenDoses = useAppStore((state) => state.takenDoses);
  const toggleDose = useAppStore((state) => state.toggleDose);

  const prescription = data?.find((entry) => entry.id === route.params.id);
  const today = todayISO();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.base, gap: theme.spacing.md }}>
        <Skeleton width="60%" height={22} />
        <Skeleton width="45%" height={13} />
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} height={68} radius={theme.radius.md} />
        ))}
      </View>
    );
  }

  if (!prescription) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: "center" }}>
        <StateView
          tone="empty"
          icon="document"
          title="Prescription not found"
          message="This prescription may have been removed. Go back and try another one."
        />
      </View>
    );
  }

  const doses = SCHEDULE.map((slot) => ({
    ...slot,
    medicines: prescription.medicines.filter((medicine) => medicine.timing.includes(slot.timing)),
  })).filter((slot) => slot.medicines.length > 0);

  const totalDoses = doses.reduce((sum, slot) => sum + slot.medicines.length, 0);
  const takenCount = doses.reduce(
    (sum, slot) =>
      sum +
      slot.medicines.filter((medicine) =>
        takenDoses[doseKey(prescription.id, medicine.id, slot.timing, today)],
      ).length,
    0,
  );
  const progress = totalDoses === 0 ? 0 : takenCount / totalDoses;

  const onToggle = (medicine: Medicine, timing: DoseTiming) => {
    if (Platform.OS !== "web") {
      void Haptics.selectionAsync().catch(() => undefined);
    }
    toggleDose(doseKey(prescription.id, medicine.id, timing, today));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.lg, paddingBottom: theme.spacing.huge }}
    >
      <View style={{ gap: 4 }}>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.title, fontWeight: "800" }}
        >
          {prescription.doctorName}
        </Text>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.small }}
        >
          {prescription.clinicName} · {formatDate(prescription.issuedAt)}
        </Text>
      </View>

      <View
        style={[
          styles.progressCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.base,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <View style={styles.progressRow}>
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.body, fontWeight: "700" }}
          >
            Today&apos;s doses
          </Text>
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={{ color: theme.colors.primary, fontSize: theme.fontSize.body, fontWeight: "800" }}
          >
            {takenCount}/{totalDoses}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: theme.colors.background, borderRadius: theme.radius.pill }]}>
          <View
            style={{
              width: `${Math.round(progress * 100)}%`,
              height: "100%",
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.pill,
            }}
          />
        </View>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }}
        >
          {takenCount === totalDoses
            ? "All done for today. Well taken care of."
            : "Tap a dose once you have taken it."}
        </Text>
      </View>

      {doses.map((slot) => {
        const slotTaken = slot.medicines.filter((medicine) =>
          takenDoses[doseKey(prescription.id, medicine.id, slot.timing, today)],
        ).length;

        return (
          <View key={slot.timing} style={{ gap: theme.spacing.sm }}>
            <View style={[styles.slotHeader, { gap: theme.spacing.sm }]}>
              <View
                style={[
                  styles.slotIcon,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.pill },
                ]}
              >
                <Icon name={slot.icon} size={15} color={theme.colors.primary} />
              </View>
              <Text
                maxFontSizeMultiplier={maxFontScale}
                style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.body, fontWeight: "700", flex: 1 }}
              >
                {slot.label}
              </Text>
              <Text
                maxFontSizeMultiplier={maxFontScale}
                style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }}
              >
                {slotTaken}/{slot.medicines.length} taken
              </Text>
            </View>

            {slot.medicines.map((medicine) => {
              const taken = Boolean(takenDoses[doseKey(prescription.id, medicine.id, slot.timing, today)]);
              const tint = withAlpha(theme.colors.success, 0.12);

              return (
                <PressableScale
                  key={`${medicine.id}-${slot.timing}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: taken }}
                  aria-checked={taken}
                  accessibilityLabel={`${medicine.name}, ${medicine.dose}, ${slot.label}`}
                  onPress={() => onToggle(medicine, slot.timing)}
                  style={[
                    styles.medicineRow,
                    {
                      backgroundColor: taken ? tint : theme.colors.surface,
                      borderColor: taken ? withAlpha(theme.colors.success, 0.4) : theme.colors.border,
                      borderRadius: theme.radius.md,
                      padding: theme.spacing.md,
                      gap: theme.spacing.md,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: taken ? theme.colors.success : theme.colors.border,
                        backgroundColor: taken ? theme.colors.success : theme.colors.surface,
                      },
                    ]}
                  >
                    {taken ? <Icon name="check" size={14} color={theme.colors.surface} /> : null}
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      maxFontSizeMultiplier={maxFontScale}
                      style={{
                        color: theme.colors.textPrimary,
                        fontSize: theme.fontSize.body,
                        fontWeight: "600",
                        textDecorationLine: taken ? "line-through" : "none",
                      }}
                    >
                      {medicine.name}
                    </Text>
                    <Text
                      maxFontSizeMultiplier={maxFontScale}
                      style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }}
                    >
                      {medicine.dose} · {medicine.days} days
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        );
      })}

      <Text
        maxFontSizeMultiplier={maxFontScale}
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.fontSize.micro,
          textAlign: "center",
          marginTop: theme.spacing.sm,
        }}
      >
        Doses reset every day. Always follow your doctor&apos;s advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    borderWidth: 1,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  track: {
    height: 8,
    overflow: "hidden",
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  slotIcon: {
    width: 30,
    height: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  medicineRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    minHeight: 56,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
