import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { usePreferences } from "../../contexts/PreferencesContext";
import { Adventure } from "../../types/adventure";
import { formatDepth, formatTemperature } from "../../utils/units";

interface AdventureDetailModalProps {
  adventure: Adventure | null;
  onClose: () => void;
}

export default function AdventureDetailModal({ adventure, onClose }: AdventureDetailModalProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const { unitSystem } = usePreferences();

  if (!adventure) {
    return null;
  }

  const hasPhoto = Boolean(adventure.photo_url) && !imageFailed;
  const hasNotes = Boolean(adventure.notes && adventure.notes.trim());
  const hasConditions =
    adventure.water_temp_c != null ||
    adventure.wave_height_m != null ||
    adventure.tide_height_m != null;

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
              <View style={styles.statPill}>
                <Ionicons name="arrow-down-outline" size={13} color="#0B3D5C" />
                <Text style={styles.statText}>
                  {formatDepth(adventure.max_depth_meters, unitSystem)}
                </Text>
              </View>
              <View style={styles.statPill}>
                <Ionicons name="time-outline" size={13} color="#0B3D5C" />
                <Text style={styles.statText}>{adventure.duration_minutes} min</Text>
              </View>
            </View>

            {hasConditions && (
              <>
                <Text style={styles.notesLabel}>OCEAN CONDITIONS</Text>
                <View style={styles.conditionsRow}>
                  {adventure.water_temp_c != null && (
                    <View style={styles.conditionPill}>
                      <Ionicons name="thermometer-outline" size={13} color="#0B3D5C" />
                      <Text style={styles.statText}>
                        {formatTemperature(adventure.water_temp_c, unitSystem)}
                      </Text>
                    </View>
                  )}
                  {adventure.wave_height_m != null && (
                    <View style={styles.conditionPill}>
                      <Ionicons name="water-outline" size={13} color="#0B3D5C" />
                      <Text style={styles.statText}>
                        {formatDepth(adventure.wave_height_m, unitSystem)} waves
                      </Text>
                    </View>
                  )}
                  {adventure.tide_height_m != null && (
                    <View style={styles.conditionPill}>
                      <Ionicons name="swap-vertical-outline" size={13} color="#0B3D5C" />
                      <Text style={styles.statText}>
                        {formatDepth(adventure.tide_height_m, unitSystem)} tide
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

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
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 12,
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
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(4, 20, 35, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#101828",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0B3D5C",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EAF6FA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B3D5C",
  },
  conditionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  conditionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EAF6FA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  notes: {
    fontSize: 14,
    color: "#344054",
    lineHeight: 21,
  },
  notesEmpty: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});
