import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Achievement } from "../../utils/achievements";

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress: (achievement: Achievement) => void;
}

export default function AchievementBadge({ achievement, onPress }: AchievementBadgeProps) {
  const { unlocked, color, emoji, name } = achievement;

  return (
    <Pressable style={styles.tile} onPress={() => onPress(achievement)} hitSlop={4}>
      <View
        style={[
          styles.iconCircle,
          unlocked
            ? {
                backgroundColor: `${color}1F`,
                borderColor: color,
                shadowColor: color,
              }
            : styles.iconCircleLocked,
        ]}
      >
        <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>{emoji}</Text>
        <View style={[styles.statusDot, unlocked ? styles.statusDotUnlocked : styles.statusDotLocked]}>
          <Ionicons name={unlocked ? "checkmark" : "lock-closed"} size={9} color="#FFFFFF" />
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
    gap: 6,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 9,
    elevation: 5,
  },
  iconCircleLocked: {
    backgroundColor: "#F2F6FC",
    borderColor: "#E2E8F0",
    opacity: 0.6,
  },
  emoji: {
    fontSize: 24,
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
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  statusDotUnlocked: {
    backgroundColor: "#1B8A5A",
  },
  statusDotLocked: {
    backgroundColor: "#94A3B8",
  },
  name: {
    fontSize: 11,
    fontWeight: "700",
    color: "#344054",
    textAlign: "center",
  },
  nameLocked: {
    color: "#94A3B8",
  },
});
