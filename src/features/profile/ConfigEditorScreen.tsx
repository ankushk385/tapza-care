import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/ui/Button";
import { ScreenTitle } from "../../components/ui/ScreenTitle";
import { parseOrThrow, layoutConfigSchema } from "../../types/config";
import { useAppStore } from "../../store/useAppStore";
import { useTheme } from "../../theme/ThemeProvider";
import { maxFontScale } from "../../theme/tokens";

export function ConfigEditorScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const configOverride = useAppStore((state) => state.configOverride);
  const setConfigOverride = useAppStore((state) => state.setConfigOverride);
  const [text, setText] = useState(() => JSON.stringify(configOverride ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      const validated = parseOrThrow(layoutConfigSchema, parsed, "config-override");
      setConfigOverride(validated);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const reset = () => {
    setConfigOverride(null);
    setText("{}");
    setError(null);
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
        <ScreenTitle title="Config studio" subtitle="Edit GET /config JSON and apply live" />
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: "700" }}>Live config JSON</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: theme.radius.md,
              padding: theme.spacing.sm,
              fontFamily: "monospace",
              fontSize: theme.fontSize.caption,
              minHeight: 320,
            }}
          />
          {error ? <Text style={{ color: theme.colors.danger, fontSize: theme.fontSize.caption }}>{error}</Text> : null}
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Button label="Apply" onPress={apply} />
            <Button label="Reset" variant="secondary" onPress={reset} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
});
