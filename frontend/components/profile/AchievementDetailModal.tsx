import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Achievement } from "../../utils/achievements";

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementDetailModal({
  achievement,
  onClose,
}: AchievementDetailModalProps) {
  if (!achievement) {
    return null;
  }

  const { unlocked, color, emoji, name, description } = achievement;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              styles.iconCircle,
              unlocked
                ? { backgroundColor: `${color}1F`, borderColor: color, shadowColor: color }
                : styles.iconCircleLocked,
            ]}
          >
            <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>{emoji}</Text>
          </View>

          <Text style={styles.name}>{name}</Text>

          <View style={[styles.statusPill, unlocked ? styles.statusPillUnlocked : styles.statusPillLocked]}>
            <Ionicons
              name={unlocked ? "checkmark-circle" : "lock-closed"}
              size={13}
              color={unlocked ? "#1B8A5A" : "#5A6B87"}
            />
            <Text style={[styles.statusText, unlocked ? styles.statusTextUnlocked : styles.statusTextLocked]}>
              {unlocked ? "Unlocked" : "Locked"}
            </Text>
          </View>

          <Text style={styles.description}>{description}</Text>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(4, 20, 35, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 14,
  },
  iconCircleLocked: {
    backgroundColor: "#F2F6FC",
    borderColor: "#E2E8F0",
  },
  emoji: {
    fontSize: 34,
  },
  emojiLocked: {
    opacity: 0.55,
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101828",
    textAlign: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 14,
  },
  statusPillUnlocked: {
    backgroundColor: "#E6F4EC",
  },
  statusPillLocked: {
    backgroundColor: "#F2F6FC",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextUnlocked: {
    color: "#1B8A5A",
  },
  statusTextLocked: {
    color: "#5A6B87",
  },
  description: {
    fontSize: 14,
    color: "#344054",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  closeButton: {
    alignSelf: "stretch",
    backgroundColor: "#0B3D91",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
