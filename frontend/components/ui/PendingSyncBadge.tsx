import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../../constants/theme";
import { showAlert } from "../../utils/crossPlatformAlert";
import { useAdventureSync } from "../../utils/useAdventureSync";

// Surfaces the offline sync queue's state wherever a screen already shows
// adventure data, so a dive logged offline never just silently disappears
// until some future sync - the whole point of saving it locally first.
export default function PendingSyncBadge() {
  const { pendingCount, failedCount, isSyncing, runSync } = useAdventureSync();

  if (pendingCount === 0 && failedCount === 0) {
    return null;
  }

  const onPressFailed = () => {
    showAlert(
      "Some adventures didn't sync",
      `${failedCount} adventure${failedCount === 1 ? "" : "s"} logged offline could not be saved to the server and won't be retried automatically. Tap OK to try syncing again.`,
      [{ text: "OK", onPress: () => runSync() }]
    );
  };

  return (
    <View style={styles.row}>
      {pendingCount > 0 && (
        <View style={styles.pill}>
          <Ionicons name={isSyncing ? "sync" : "cloud-upload-outline"} size={13} color={colors.secondary} />
          <Text style={styles.pillText}>
            {pendingCount} pending sync
          </Text>
        </View>
      )}
      {failedCount > 0 && (
        <Pressable style={styles.failedPill} onPress={onPressFailed} hitSlop={6}>
          <Ionicons name="alert-circle-outline" size={13} color={colors.error} />
          <Text style={styles.failedPillText}>{failedCount} failed to sync</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    backgroundColor: colors.surface.tint,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  pillText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    color: colors.secondary,
  },
  failedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    backgroundColor: colors.errorTint,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  failedPillText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    color: colors.error,
  },
});
