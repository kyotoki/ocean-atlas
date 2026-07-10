import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "../../constants/theme";
import { Achievement } from "../../utils/achievements";

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress: (achievement: Achievement) => void;
}

export default function AchievementBadge({ achievement, onPress }: AchievementBadgeProps) {
  const { unlocked, color, emoji, name } = achievement;

  return (
    <Pressable
      style={styles.tile}
      onPress={() => onPress(achievement)}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${unlocked ? "unlocked" : "locked"}`}
    >
      <View
        style={[
          styles.iconCircle,
          unlocked
            ? {
                backgroundColor: withOpacity(color, 0.12),
                borderColor: color,
                shadowColor: color,
              }
            : styles.iconCircleLocked,
        ]}
      >
        <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>{emoji}</Text>
        <View style={[styles.statusDot, unlocked ? styles.statusDotUnlocked : styles.statusDotLocked]}>
          <Ionicons name={unlocked ? "checkmark" : "lock-closed"} size={9} color={colors.text.inverse} />
        </View>
      </View>
      <Text style={[styles.name, !unlocked && styles.nameLocked]} numberOfLines={2}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 82,
    alignItems: "center",
    gap: spacing.xs,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    // One-off glow shadow - color is dynamic (per achievement), so only the
    // shape (offset/opacity/radius/elevation) would be shared with a token,
    // and no existing elevation preset matches this specific combination.
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 9,
    elevation: 5,
  },
  iconCircleLocked: {
    backgroundColor: colors.surface.page,
    borderColor: colors.border.default,
    opacity: 0.6,
  },
  emoji: {
    fontSize: typography.size.headline,
  },
  emojiLocked: {
    opacity: 0.5,
  },
  statusDot: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface.card,
  },
  statusDotUnlocked: {
    backgroundColor: colors.success,
  },
  statusDotLocked: {
    backgroundColor: colors.text.tertiary,
  },
  name: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    color: colors.text.label,
    textAlign: "center",
  },
  nameLocked: {
    color: colors.text.tertiary,
  },
});
