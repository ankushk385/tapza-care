import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { isSlotTakenError, useCreateBooking, useSlots } from "../../api/queries";
import { Icon } from "../../components/ui/Icon";
import { Button } from "../../components/ui/Button";
import { RemoteImage } from "../../components/ui/RemoteImage";
import { Skeleton } from "../../components/ui/Skeleton";
import { StateView } from "../../components/ui/StateView";
import { formatDate, formatRupees, formatTime, todayISO, upcomingDays } from "../../lib/format";
import { maxFontScale } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import type { BookingTarget } from "../../store/useAppStore";
import type { Slot } from "../../types/config";
import { SuccessPanel } from "./SuccessPanel";

function tapHaptic() {
  if (Platform.OS === "web") return;
  void Haptics.selectionAsync().catch(() => undefined);
}

function successHaptic() {
  if (Platform.OS === "web") return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

/**
 * Gesture-driven bottom sheet, built directly on Reanimated + Gesture Handler
 * instead of a sheet library: dragging the header moves the sheet, releasing
 * past the threshold dismisses it. ~60 lines and nothing to debug on web.
 */
export function BookingSheet({
  target,
  onClose,
}: {
  target: BookingTarget;
  onClose: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();

  const translateY = useSharedValue(height);
  const days = useMemo(() => upcomingDays(5), []);
  const [date, setDate] = useState(todayISO());
  const [selected, setSelected] = useState<Slot | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ date: string; time: string } | null>(null);

  const slotsQuery = useSlots(target.id, date);
  const booking = useCreateBooking();

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 26, stiffness: 220 });
  }, [translateY]);

  const dismiss = () => {
    translateY.value = withTiming(height, { duration: 200 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY > 130 || event.velocityY > 900) {
        translateY.value = withTiming(height, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 26, stiffness: 220 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const onConfirm = () => {
    if (!selected) return;
    setFailure(null);
    tapHaptic();

    booking.mutate(
      { doctorId: target.id, slotId: selected.id, date },
      {
        onSuccess: () => {
          successHaptic();
          setConfirmed({ date: formatDate(`${date}T00:00:00`), time: formatTime(selected.startsAt) });
        },
        onError: (error) => {
          if (isSlotTakenError(error)) {
            setFailure("That slot was just taken. Please pick another time.");
            setSelected(null);
            void slotsQuery.refetch();
          } else {
            setFailure("Couldn't confirm the booking. Check your connection and try again.");
          }
        },
      },
    );
  };

  const cardWidth = Math.floor((width - theme.spacing.base * 2 - theme.spacing.sm * 2) / 3);

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Pressable
        accessibilityLabel="Close booking"
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
        onPress={dismiss}
      />

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            paddingBottom: insets.bottom + theme.spacing.base,
            maxHeight: height * 0.9,
          },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={pan}>
          <View style={{ paddingHorizontal: theme.spacing.base }}>
            <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.headerRow, { gap: theme.spacing.md }]}>
              {target.photoUrl ? (
                <RemoteImage
                  uri={target.photoUrl}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : null}
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  maxFontSizeMultiplier={maxFontScale}
                  numberOfLines={1}
                  style={{
                    color: theme.colors.textPrimary,
                    fontSize: theme.fontSize.subtitle,
                    fontWeight: "700",
                  }}
                >
                  {target.name}
                </Text>
                <Text
                  maxFontSizeMultiplier={maxFontScale}
                  numberOfLines={1}
                  style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }}
                >
                  {target.subtitle}
                </Text>
              </View>
              <Text
                maxFontSizeMultiplier={maxFontScale}
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSize.subtitle,
                  fontWeight: "700",
                }}
              >
                {formatRupees(target.feeInr)}
              </Text>
            </View>
          </View>
        </GestureDetector>

        {confirmed ? (
          <SuccessPanel
            title="Booking confirmed"
            subtitle={`${target.name} · ${confirmed.date} at ${confirmed.time}`}
            onDone={onClose}
          />
        ) : (
          <View style={{ paddingHorizontal: theme.spacing.base, gap: theme.spacing.md }}>
            <Text
              maxFontSizeMultiplier={maxFontScale}
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSize.caption,
                fontWeight: "700",
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Pick a date
            </Text>

            <View style={[styles.dateRow, { gap: theme.spacing.sm }]}>
              {days.map((day) => {
                const active = day.iso === date;
                return (
                  <Pressable
                    key={day.iso}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${day.weekday} ${day.dayNumber}`}
                    onPress={() => {
                      tapHaptic();
                      setDate(day.iso);
                      setSelected(null);
                      setFailure(null);
                    }}
                    style={[
                      styles.dateCard,
                      {
                        backgroundColor: active ? theme.colors.primary : theme.colors.background,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                  >
                    <Text
                      maxFontSizeMultiplier={maxFontScale}
                      style={{
                        color: active ? theme.colors.onPrimary : theme.colors.textSecondary,
                        fontSize: theme.fontSize.micro,
                        fontWeight: "600",
                      }}
                    >
                      {day.weekday}
                    </Text>
                    <Text
                      maxFontSizeMultiplier={maxFontScale}
                      style={{
                        color: active ? theme.colors.onPrimary : theme.colors.textPrimary,
                        fontSize: theme.fontSize.body,
                        fontWeight: "700",
                      }}
                    >
                      {day.dayNumber}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {failure ? (
              <View
                style={[
                  styles.banner,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.danger,
                    borderRadius: theme.radius.md,
                    gap: theme.spacing.sm,
                  },
                ]}
              >
                <Icon name="warning" size={16} color={theme.colors.danger} />
                <Text
                  maxFontSizeMultiplier={maxFontScale}
                  style={{ color: theme.colors.danger, fontSize: theme.fontSize.caption, flex: 1 }}
                >
                  {failure}
                </Text>
              </View>
            ) : null}

            {slotsQuery.isLoading ? (
              <View style={[styles.slotGrid, { gap: theme.spacing.sm }]}>
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} width={cardWidth} height={46} radius={theme.radius.sm} />
                ))}
              </View>
            ) : slotsQuery.isError ? (
              <StateView
                compact
                tone="error"
                icon="warning"
                title="Couldn't load slots"
                message="The clinic server didn't answer. Try again."
                actionLabel="Retry"
                onAction={() => void slotsQuery.refetch()}
              />
            ) : (slotsQuery.data ?? []).every((slot) => !slot.available) ? (
              <StateView
                compact
                tone="empty"
                icon="calendar"
                title="No slots left"
                message="This day is fully booked. Try another date."
              />
            ) : (
              <View style={[styles.slotGrid, { gap: theme.spacing.sm }]}>
                {(slotsQuery.data ?? []).map((slot) => {
                  const active = selected?.id === slot.id;
                  return (
                    <Pressable
                      key={slot.id}
                      disabled={!slot.available || booking.isPending}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: !slot.available, selected: active }}
                      accessibilityLabel={`${formatTime(slot.startsAt)}${slot.available ? "" : ", unavailable"}`}
                      onPress={() => {
                        tapHaptic();
                        setSelected(slot);
                      }}
                      style={[
                        styles.slot,
                        {
                          width: cardWidth,
                          borderColor: active
                            ? theme.colors.primary
                            : slot.available
                              ? theme.colors.border
                              : theme.colors.skeleton,
                          backgroundColor: active
                            ? theme.colors.primary
                            : slot.available
                              ? theme.colors.background
                              : theme.colors.skeleton,
                          borderRadius: theme.radius.sm,
                        },
                      ]}
                    >
                      <Text
                        maxFontSizeMultiplier={maxFontScale}
                        style={{
                          color: active
                            ? theme.colors.onPrimary
                            : slot.available
                              ? theme.colors.textPrimary
                              : theme.colors.textSecondary,
                          fontSize: theme.fontSize.caption,
                          fontWeight: "600",
                          textDecorationLine: slot.available ? "none" : "line-through",
                        }}
                      >
                        {formatTime(slot.startsAt)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Button
              label={
                !selected
                  ? "Select a time"
                  : booking.isPending
                    ? "Confirming…"
                    : `Confirm · ${formatTime(selected.startsAt)}`
              }
              onPress={onConfirm}
              disabled={!selected || booking.isPending}
              loading={booking.isPending}
            />

            <Text
              maxFontSizeMultiplier={maxFontScale}
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSize.micro,
                textAlign: "center",
              }}
            >
              Free cancellation up to 2 hours before your visit
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    paddingTop: 8,
    gap: 14,
  },
  grabber: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateCard: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  slot: {
    height: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
  },
});
