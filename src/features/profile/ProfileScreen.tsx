import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "../../components/ui/Icon";
import { PressableScale } from "../../components/ui/PressableScale";
import { ScreenTitle } from "../../components/ui/ScreenTitle";
import { withAlpha } from "../../lib/color";
import type { Latency } from "../../api/mock/settings";
import { useMockSettings } from "../../api/mock/settings";
import { useAppStore } from "../../store/useAppStore";
import { maxFontScale, minTapTarget } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.segmented,
        { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: theme.radius.md },
      ]}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <PressableScale
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              {
                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                borderRadius: theme.radius.sm,
              },
            ]}
          >
            <Text
              maxFontSizeMultiplier={maxFontScale}
              numberOfLines={1}
              style={{
                color: active ? theme.colors.onPrimary : theme.colors.textSecondary,
                fontSize: theme.fontSize.caption,
                fontWeight: "700",
              }}
            >
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { gap: theme.spacing.md, minHeight: 48 }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.body, fontWeight: "600" }}
        >
          {label}
        </Text>
        {hint ? (
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.border, true: withAlpha(theme.colors.primary, 0.5) }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
      />
    </View>
  );
}

/**
 * Profile doubles as the demo control room: layout variant, network conditions,
 * empty lists and slot races. This is deliberately visible so the reviewer can
 * reproduce every state without editing code.
 */
export function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const variant = useAppStore((state) => state.variant);
  const setVariant = useAppStore((state) => state.setVariant);
  const clearData = useAppStore((state) => state.clearData);

  const latency = useMockSettings((state) => state.latency);
  const setLatency = useMockSettings((state) => state.setLatency);
  const failMode = useMockSettings((state) => state.failMode);
  const setFailMode = useMockSettings((state) => state.setFailMode);
  const emptyLists = useMockSettings((state) => state.emptyLists);
  const setEmptyLists = useMockSettings((state) => state.setEmptyLists);
  const setConflictNext = useMockSettings((state) => state.setConflictNext);
  const conflictNext = useMockSettings((state) => state.conflictNext);

  const cardStyle = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    gap: theme.spacing.md,
    borderWidth: 1,
  };

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
        <ScreenTitle title="You" subtitle="Profile and demo controls" />

        <View style={[styles.patientCard, cardStyle]}>
          <View style={[styles.avatar, { backgroundColor: withAlpha(theme.colors.primary, 0.14) }]}>
            <Text
              maxFontSizeMultiplier={maxFontScale}
              style={{ color: theme.colors.primary, fontSize: theme.fontSize.title, fontWeight: "800" }}
            >
              AS
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              maxFontSizeMultiplier={maxFontScale}
              style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.body, fontWeight: "700" }}
            >
              Anjali Sharma
            </Text>
            <Text
              maxFontSizeMultiplier={maxFontScale}
              style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }}
            >
              +91 98••• ••210 · Jubilee Hills
            </Text>
          </View>
          <Icon name="person" size={18} color={theme.colors.textSecondary} />
        </View>

        <View style={cardStyle}>
          <View style={[styles.row, { gap: 8 }]}>
            <Icon name="bug" size={16} color={theme.colors.primary} />
            <Text
              maxFontSizeMultiplier={maxFontScale}
              style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.body, fontWeight: "700" }}
            >
              Demo controls
            </Text>
          </View>
          <Text
            maxFontSizeMultiplier={maxFontScale}
            style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, lineHeight: 18 }}
          >
            Everything here talks to the mock API, not to code. The layout comes from GET /config.
          </Text>

          <View style={{ gap: theme.spacing.sm }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, fontWeight: "700" }}>
              Layout
            </Text>
            <Segmented
              value={variant}
              onChange={setVariant}
              options={[
                { value: "normal", label: "Normal day" },
                { value: "festival", label: "Diwali" },
              ]}
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, fontWeight: "700" }}>
              Network
            </Text>
            <Segmented
              value={latency}
              onChange={(value) => setLatency(value as Latency)}
              options={[
                { value: 0, label: "Instant" },
                { value: 800, label: "Slow" },
                { value: 2500, label: "Very slow" },
              ]}
            />
          </View>

          <ToggleRow
            label="Fail every request"
            hint="Shows the error state, or the cached layout if one exists."
            value={failMode === "always"}
            onChange={(value) => setFailMode(value ? "always" : "off")}
          />

          <ToggleRow
            label="Empty lists"
            hint="Doctors and prescriptions return [] to show empty states."
            value={emptyLists}
            onChange={setEmptyLists}
          />

          <View style={[styles.actionRow, { gap: theme.spacing.sm }]}>
            <PressableScale
              accessibilityRole="button"
              onPress={() => setFailMode("next")}
              style={[
                styles.action,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  backgroundColor:
                    failMode === "next" ? withAlpha(theme.colors.warning, 0.14) : theme.colors.background,
                },
              ]}
            >
              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.caption, fontWeight: "700" }}>
                Fail next request
              </Text>
            </PressableScale>

            <PressableScale
              accessibilityRole="button"
              onPress={() => setConflictNext(true)}
              style={[
                styles.action,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  backgroundColor: conflictNext
                    ? withAlpha(theme.colors.danger, 0.12)
                    : theme.colors.background,
                },
              ]}
            >
              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.caption, fontWeight: "700" }}>
                409 on next booking
              </Text>
            </PressableScale>
          </View>

          <PressableScale
            accessibilityRole="button"
            onPress={clearData}
            style={[
              styles.action,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <Text style={{ color: theme.colors.danger, fontSize: theme.fontSize.caption, fontWeight: "700" }}>
              Reset doses and bookings
            </Text>
          </PressableScale>
        </View>

        <Text
          maxFontSizeMultiplier={maxFontScale}
          style={{
            textAlign: "center",
            color: theme.colors.textSecondary,
            fontSize: theme.fontSize.micro,
            lineHeight: 16,
          }}
        >
          Tapza Care demo · config-driven home, mock backend{"\n"}
          Long-press the home title to switch themes instantly.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  segmented: {
    flexDirection: "row",
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: minTapTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  actionRow: {
    flexDirection: "row",
  },
  action: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
});
