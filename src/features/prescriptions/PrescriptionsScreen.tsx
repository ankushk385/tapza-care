import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { usePrescriptions } from "../../api/queries";
import { Icon } from "../../components/ui/Icon";
import { PressableScale } from "../../components/ui/PressableScale";
import { ScreenTitle } from "../../components/ui/ScreenTitle";
import { Skeleton } from "../../components/ui/Skeleton";
import { StateView } from "../../components/ui/StateView";
import { formatDate } from "../../lib/format";
import type { PrescriptionsStackParamList } from "../../navigation/types";
import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import type { Prescription } from "../../types/config";

type ListNavigation = NativeStackNavigationProp<PrescriptionsStackParamList, "PrescriptionsList">;

function summarise(prescription: Prescription): string {
  const count = prescription.medicines.length;
  return `${count} medicine${count === 1 ? "" : "s"}`;
}

export function PrescriptionsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ListNavigation>();
  const { data, isLoading, isError, refetch } = usePrescriptions();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: theme.spacing.huge,
          paddingHorizontal: theme.spacing.base,
          gap: theme.spacing.md,
        }}
      >
        <ScreenTitle
          title="Prescriptions"
          subtitle={data ? `${data.length} from your clinic visits` : "From your clinic visits"}
        />

        {isLoading ? (
          [0, 1].map((key) => (
            <View
              key={key}
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
              <Skeleton width="55%" height={16} />
              <Skeleton width="40%" height={12} />
              <Skeleton width="70%" height={12} />
            </View>
          ))
        ) : isError ? (
          <StateView
            tone="error"
            icon="warning"
            title="Couldn't load prescriptions"
            message="We couldn't reach the clinic server. Your medicines are safe — try again."
            actionLabel="Retry"
            onAction={() => void refetch()}
          />
        ) : (data ?? []).length === 0 ? (
          <StateView
            tone="empty"
            icon="document"
            title="No prescriptions yet"
            message="After your next visit, the doctor's prescription will appear here and on WhatsApp."
          />
        ) : (
          (data ?? []).map((prescription) => (
            <PressableScale
              key={prescription.id}
              accessibilityRole="button"
              accessibilityLabel={`${prescription.doctorName}, ${formatDate(prescription.issuedAt)}`}
              onPress={() => navigation.navigate("PrescriptionDetail", { id: prescription.id })}
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
                <View
                  style={[
                    styles.rxBadge,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                >
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    style={{
                      color: theme.colors.primary,
                      fontSize: theme.fontSize.caption,
                      fontWeight: "800",
                    }}
                  >
                    Rx
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    numberOfLines={1}
                    style={{
                      color: theme.colors.textPrimary,
                      fontSize: theme.fontSize.body,
                      fontWeight: "700",
                    }}
                  >
                    {prescription.doctorName}
                  </Text>
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    numberOfLines={1}
                    style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }}
                  >
                    {prescription.clinicName}
                  </Text>
                </View>
                <Icon name="chevron" size={18} color={theme.colors.textSecondary} />
              </View>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.border, marginVertical: 2 },
                ]}
              />

              <View style={styles.row}>
                <Text
                  maxFontSizeMultiplier={maxFontScale}
                  style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, flex: 1 }}
                >
                  {formatDate(prescription.issuedAt)} · {summarise(prescription)}
                </Text>
                <Text
                  maxFontSizeMultiplier={maxFontScale}
                  style={{
                    color: theme.colors.primary,
                    fontSize: theme.fontSize.caption,
                    fontWeight: "700",
                  }}
                >
                  View schedule
                </Text>
              </View>
            </PressableScale>
          ))
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
    gap: 10,
  },
  rxBadge: {
    width: 34,
    height: 34,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
