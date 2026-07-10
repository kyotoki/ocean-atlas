import { StyleSheet, View } from "react-native";

import { spacing } from "../../constants/theme";
import { depthUnitLabel, UnitSystem } from "../../utils/units";
import FormField from "./FormField";

interface DiveMetricsFieldsProps {
  // True for scuba and freediving (both track how deep the diver went);
  // false for snorkeling, which is surface-based.
  showMaxDepth: boolean;
  unitSystem: UnitSystem;
  maxDepth: string;
  onChangeMaxDepth: (value: string) => void;
  maxDepthError?: string;
  duration: string;
  onChangeDuration: (value: string) => void;
  durationError?: string;
}

export default function DiveMetricsFields({
  showMaxDepth,
  unitSystem,
  maxDepth,
  onChangeMaxDepth,
  maxDepthError,
  duration,
  onChangeDuration,
  durationError,
}: DiveMetricsFieldsProps) {
  const isImperial = unitSystem === "imperial";

  if (!showMaxDepth) {
    return (
      <FormField
        label="Duration (min)"
        placeholder="45"
        value={duration}
        onChangeText={onChangeDuration}
        error={durationError}
        keyboardType="numeric"
      />
    );
  }

  return (
    <View style={styles.row}>
      <FormField
        label={`Max Depth (${depthUnitLabel(unitSystem)})`}
        placeholder={isImperial ? "60" : "18"}
        value={maxDepth}
        onChangeText={onChangeMaxDepth}
        error={maxDepthError}
        keyboardType="numeric"
        containerStyle={styles.halfField}
      />
      <FormField
        label="Duration (min)"
        placeholder="45"
        value={duration}
        onChangeText={onChangeDuration}
        error={durationError}
        keyboardType="numeric"
        containerStyle={styles.halfField}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
});
