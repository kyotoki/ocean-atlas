import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Adventure } from "../../types/adventure";

interface AdventureDetailModalProps {
  adventure: Adventure | null;
  onClose: () => void;
}

export default function AdventureDetailModal({ adventure, onClose }: AdventureDetailModalProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!adventure) {
    return null;
  }

  const hasPhoto = Boolean(adventure.photo_url) && !imageFailed;
  const hasNotes = Boolean(adventure.notes && adventure.notes.trim());

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.photoWrap}>
            {hasPhoto ? (
              <Image
                source={{ uri: adventure.photo_url! }}
                style={styles.photo}
                resizeMode="cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <Ionicons name="image-outline" size={32} color="#94A3B8" />
                <Text style={styles.photoPlaceholderText}>
                  {imageFailed ? "Photo unavailable" : "No photo added"}
                </Text>
              </View>
            )}
            <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={styles.title}>{adventure.title}</Text>
            <Text style={styles.subtitle}>{adventure.location_name}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Ionicons name="arrow-down-outline" size={14} color="#5A6B87" />
                <Text style={styles.statText}>{adventure.max_depth_meters} m</Text>
              </View>
              <View style={styles.statBlock}>
                <Ionicons name="time-outline" size={14} color="#5A6B87" />
                <Text style={styles.statText}>{adventure.duration_minutes} min</Text>
              </View>
            </View>

            <Text style={styles.notesLabel}>NOTES</Text>
            <Text style={hasNotes ? styles.notes : styles.notesEmpty}>
              {hasNotes ? adventure.notes : "No notes added for this dive."}
            </Text>
          </View>
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
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  photoWrap: {
    width: "100%",
    height: 180,
    backgroundColor: "#E2E8F0",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(4, 20, 35, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    fontSize: 14,
    color: "#5A6B87",
    marginTop: 2,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },
  statBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: "#5A6B87",
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5A6B87",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  notes: {
    fontSize: 14,
    color: "#344054",
    lineHeight: 20,
  },
  notesEmpty: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});
