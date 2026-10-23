import { ScrollView, StyleSheet, Text, View } from "react-native";

import { RemoteImage } from "../../../components/ui/RemoteImage";
import { PressableScale } from "../../../components/ui/PressableScale";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateView } from "../../../components/ui/StateView";
import { Icon } from "../../../components/ui/Icon";
import { useDoctors } from "../../../api/queries";
import { formatRupees } from "../../../lib/format";
import { componentSize, maxFontScale, minTapTarget } from "../../../theme/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { doctorRefItemSchema, type HomeSection } from "../../../types/config";
import { useBandPalette } from "../band";

export function DoctorCarousel({
  section,
  onBook,
}: {
  section: HomeSection;
  onBook: (doctorId: string) => void;
}) {
  const theme = useTheme();
  const band = useBandPalette();
  const { data, isLoading } = useDoctors();

  const ids = section.items.flatMap((raw) => {
    const parsed = doctorRefItemSchema.safeParse(raw);
    return parsed.success ? [parsed.data.doctorId] : [];
  });

  const doctors = ids.flatMap((id) => {
    const match = data?.find((doctor) => doctor.id === id);
    return match ? [match] : [];
  });

  return (
    <View style={{ gap: theme.spacing.md }}>
      <SectionHeader title={section.title} />

      {isLoading ? (
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -theme.spacing.base }}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.base, gap: theme.spacing.sm }}
        >
          {[0, 1].map((key) => (
            <View
              key={key}
              style={[
                styles.card,
                {
                  width: componentSize.doctorCardWidth,
                  backgroundColor: band.card,
                  borderColor: band.border,
                  borderRadius: theme.radius.lg,
                  gap: theme.spacing.md,
                },
              ]}
            >
              <Skeleton
                width={componentSize.doctorAvatar}
                height={componentSize.doctorAvatar}
                radius={componentSize.doctorAvatar / 2}
              />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="70%" height={14} />
                <Skeleton width="50%" height={11} />
                <Skeleton width="60%" height={11} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : doctors.length === 0 ? (
        <StateView
          compact
          tone="empty"
          icon="people"
          title="No doctors on duty"
          message="Everyone is booked right now. Try another day or pick a service instead."
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -theme.spacing.base }}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.base, gap: theme.spacing.sm }}
        >
          {doctors.map((doctor) => (
            <View
              key={doctor.id}
              style={[
                styles.card,
                {
                  width: componentSize.doctorCardWidth,
                  backgroundColor: band.card,
                  borderColor: band.border,
                  borderRadius: theme.radius.lg,
                  padding: theme.spacing.md,
                  gap: theme.spacing.sm,
                },
              ]}
            >
              <View style={[styles.identity, { gap: theme.spacing.sm }]}>
                <RemoteImage
                  uri={doctor.photoUrl}
                  accessibilityLabel={doctor.name}
                  style={{
                    width: componentSize.doctorAvatar,
                    height: componentSize.doctorAvatar,
                    borderRadius: componentSize.doctorAvatar / 2,
                  }}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    numberOfLines={1}
                    style={[styles.name, { color: band.text, fontSize: theme.fontSize.small }]}
                  >
                    {doctor.name}
                  </Text>
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    numberOfLines={1}
                    style={{ color: band.muted, fontSize: theme.fontSize.caption }}
                  >
                    {doctor.specialty}
                  </Text>
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    numberOfLines={1}
                    style={{ color: band.muted, fontSize: theme.fontSize.micro }}
                  >
                    {doctor.languages.join(" · ")}
                  </Text>
                </View>
              </View>

              <View style={[styles.slotRow, { gap: theme.spacing.xs }]}>
                <Icon name="time" size={13} color={band.accent} />
                <Text
                  maxFontSizeMultiplier={maxFontScale}
                  numberOfLines={1}
                  style={{ color: band.accent, fontSize: theme.fontSize.caption, fontWeight: "600" }}
                >
                  Next: {doctor.nextAvailable}
                </Text>
              </View>

              <View style={styles.footer}>
                <Text
                  maxFontSizeMultiplier={maxFontScale}
                  style={{ color: band.text, fontSize: theme.fontSize.caption, fontWeight: "700" }}
                >
                  {formatRupees(doctor.feeInr)}
                </Text>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`Book ${doctor.name}`}
                  onPress={() => onBook(doctor.id)}
                  style={[
                    styles.bookButton,
                    {
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.radius.pill,
                      paddingHorizontal: theme.spacing.md,
                    },
                  ]}
                >
                  <Text
                    maxFontSizeMultiplier={maxFontScale}
                    style={{
                      color: theme.colors.onPrimary,
                      fontSize: theme.fontSize.caption,
                      fontWeight: "700",
                    }}
                  >
                    Book
                  </Text>
                </PressableScale>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    flexDirection: "column",
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontWeight: "700",
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookButton: {
    minHeight: minTapTarget,
    alignItems: "center",
    justifyContent: "center",
  },
});
