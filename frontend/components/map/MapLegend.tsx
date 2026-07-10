import { StyleSheet, Text, View } from "react-native";

import { ACTIVITY_TYPES } from "../../constants/activityTypes";
import { colors, radius, spacing, typography, withOpacity } from "../../constants/theme";

// A small always-on key for what each map pin's icon means - icon shape (not
// just color) is the actual distinguishing signal between activity types
// (see CyanDivePin/DiveMapView.web.tsx), so this is what makes that legible
// rather than assumed.
export default function MapLegend() {
  return (
    <View style={styles.container} pointerEvents="none">
      {ACTIVITY_TYPES.map((option) => (
        <View key={option.value} style={styles.row}>
          <Text style={styles.emoji}>{option.markerEmoji}</Text>
          <Text style={styles.label}>{option.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: withOpacity(colors.surface.card, 0.92),
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xxs,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  emoji: {
    fontSize: typography.size.small,
    width: 18,
    textAlign: "center",
  },
  label: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
});
