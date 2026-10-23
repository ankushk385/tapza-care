import { useState, useEffect } from "react";
import {
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { useConfig, useDoctors } from "../../api/queries";
import { Icon } from "../../components/ui/Icon";
import { PressableScale } from "../../components/ui/PressableScale";
import { StateView } from "../../components/ui/StateView";
import { BookingSheet } from "../booking/BookingSheet";
import { withAlpha } from "../../lib/color";
import { useAppStore, type BookingTarget } from "../../store/useAppStore";
import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import type { TabNavigation } from "../../navigation/types";
import { HomeHeader } from "./HomeHeader";
import { HomeSkeleton } from "./HomeSkeleton";
import { SectionRenderer, type SectionActions } from "./SectionRenderer";

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: viewportHeight } = useWindowDimensions();
  const navigation = useNavigation<TabNavigation>();
  const route = useRoute();
  const [bookingTarget, setBookingTarget] = useState<BookingTarget | null>(null);

  const variant = useAppStore((state) => state.variant);
  const setVariant = useAppStore((state) => state.setVariant);

  const { config, isLoading, isOffline, refetch, isFetching } = useConfig(variant);
  const { data: doctors } = useDoctors();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Deep link: tapzacare://doctor/:doctorId opens the booking sheet.
  useEffect(() => {
    const params = route.params as { doctorId?: string } | undefined;
    const doctorId = params?.doctorId;
    if (!doctorId || !doctors) return;
    if (bookingTarget?.id === doctorId) return;
    const doctor = doctors.find((entry) => entry.id === doctorId);
    if (!doctor) return;
    setBookingTarget({
      kind: "doctor",
      id: doctor.id,
      name: doctor.name,
      subtitle: `${doctor.specialty} · ${doctor.clinicName}`,
      feeInr: doctor.feeInr,
      photoUrl: doctor.photoUrl,
    });
  }, [route.params, doctors, bookingTarget?.id]);

  const openDoctor = (doctorId: string) => {
    const doctor = doctors?.find((entry) => entry.id === doctorId);
    if (!doctor) return;
    setBookingTarget({
      kind: "doctor",
      id: doctor.id,
      name: doctor.name,
      subtitle: `${doctor.specialty} · ${doctor.clinicName}`,
      feeInr: doctor.feeInr,
      photoUrl: doctor.photoUrl,
    });
  };

  const openService = (name: string, priceInr: number, imageUrl?: string) => {
    setBookingTarget({
      kind: "service",
      id: `svc-${slug(name)}`,
      name,
      subtitle: "Clinic service · 30 min",
      feeInr: priceInr,
      photoUrl: imageUrl,
    });
  };

  const actions: SectionActions = {
    onBookDoctor: openDoctor,
    onBookService: openService,
    onNavigate: (tab) => navigation.navigate(tab),
  };

  const toggleVariant = () => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    setVariant(variant === "normal" ? "festival" : "normal");
  };

  if (!config) {
    if (isLoading) return <HomeSkeleton topInset={insets.top} />;
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: "center" }}>
        <StateView
          tone="error"
          icon="offline"
          title="Can't reach the clinic"
          message="The layout didn't load and there's nothing saved yet. Check your connection and try again."
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 64, paddingBottom: theme.spacing.xxl }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => void refetch()}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressViewOffset={insets.top + 40}
          />
        }
      >
        {isOffline ? (
          <View
            style={[
              styles.offline,
              {
                marginHorizontal: theme.spacing.base,
                marginBottom: theme.spacing.sm,
                padding: theme.spacing.md,
                gap: theme.spacing.sm,
                backgroundColor: withAlpha(theme.colors.warning, 0.12),
                borderColor: withAlpha(theme.colors.warning, 0.35),
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Icon name="offline" size={16} color={theme.colors.warning} />
            <Text
              maxFontSizeMultiplier={maxFontScale}
              style={{ flex: 1, color: theme.colors.warning, fontSize: theme.fontSize.caption }}
            >
              Showing your saved layout. We&apos;ll refresh when the network is back.
            </Text>
            <PressableScale accessibilityRole="button" onPress={() => void refetch()} hitSlop={8}>
              <Text
                maxFontSizeMultiplier={maxFontScale}
                style={{
                  color: theme.colors.warning,
                  fontSize: theme.fontSize.caption,
                  fontWeight: "700",
                }}
              >
                Retry
              </Text>
            </PressableScale>
          </View>
        ) : null}

        {config.sections.length === 0 ? (
          <StateView
            tone="empty"
            icon="empty"
            title="Nothing here yet"
            message="The clinic hasn't published any sections for today. Pull down to check again."
            actionLabel="Refresh"
            onAction={() => void refetch()}
          />
        ) : (
          config.sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              actions={actions}
            />
          ))
        )}

        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={{
            textAlign: "center",
            marginTop: theme.spacing.lg,
            color: theme.colors.textSecondary,
            fontSize: theme.fontSize.micro,
          }}
        >
          Layout v{config.version} · rendered from GET /config
        </Text>
      </Animated.ScrollView>

      <HomeHeader
        config={config}
        scrollY={scrollY}
        topInset={insets.top}
        onLongPressTitle={toggleVariant}
      />

      {bookingTarget ? (
        <BookingSheet target={bookingTarget} onClose={() => setBookingTarget(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  offline: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
});
