import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, elevation, radius, spacing, typography } from "../../constants/theme";
import { usePreferences } from "../../contexts/PreferencesContext";
import { Adventure } from "../../types/adventure";
import { showAlert } from "../../utils/crossPlatformAlert";
import { formatDepth, formatTemperature } from "../../utils/units";
import WaveSpinner from "../ui/WaveSpinner";
import PhotoCarousel from "./PhotoCarousel";

interface AdventureDetailModalProps {
  adventure: Adventure | null;
  onClose: () => void;
  onDelete: (adventure: Adventure) => Promise<void>;
}

export default function AdventureDetailModal({
  adventure,
  onClose,
  onDelete,
}: AdventureDetailModalProps) {
  const { unitSystem } = usePreferences();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!adventure) {
    return null;
  }

  const handleDeletePress = () => {
    showAlert(
      "Delete Adventure",
      "Are you sure you want to permanently delete this adventure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await onDelete(adventure);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

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
            <PhotoCarousel photos={adventure.photos} height={180} />
            <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color={colors.text.inverse} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={styles.title}>{adventure.title}</Text>
            <Text style={styles.subtitle}>{adventure.location_name}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Ionicons name="arrow-down-outline" size={13} color={colors.secondary} />
                <Text style={styles.statText}>
                  {formatDepth(adventure.max_depth_meters, unitSystem)}
                </Text>
              </View>
              <View style={styles.statPill}>
                <Ionicons name="time-outline" size={13} color={colors.secondary} />
                <Text style={styles.statText}>{adventure.duration_minutes} min</Text>
              </View>
            </View>

            {hasConditions && (
              <>
                <Text style={styles.notesLabel}>OCEAN CONDITIONS</Text>
                <View style={styles.conditionsRow}>
                  {adventure.water_temp_c != null && (
                    <View style={styles.conditionPill}>
                      <Ionicons name="thermometer-outline" size={13} color={colors.secondary} />
                      <Text style={styles.statText}>
                        {formatTemperature(adventure.water_temp_c, unitSystem)}
                      </Text>
                    </View>
                  )}
                  {adventure.wave_height_m != null && (
                    <View style={styles.conditionPill}>
                      <Ionicons name="water-outline" size={13} color={colors.secondary} />
                      <Text style={styles.statText}>
                        {formatDepth(adventure.wave_height_m, unitSystem)} waves
                      </Text>
                    </View>
                  )}
                  {adventure.tide_height_m != null && (
                    <View style={styles.conditionPill}>
                      <Ionicons name="swap-vertical-outline" size={13} color={colors.secondary} />
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

            <Pressable
              style={styles.deleteButton}
              onPress={handleDeletePress}
              hitSlop={8}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <WaveSpinner size="small" color={colors.error} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={15} color={colors.error} />
                  <Text style={styles.deleteButtonText}>Delete Log</Text>
                </>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay.modalScrim,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface.card,
    borderRadius: radius.xxl,
    overflow: "hidden",
    ...elevation.modal,
  },
  photoWrap: {
    width: "100%",
    height: 180,
    backgroundColor: colors.border.default,
  },
  closeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.overlay.modalScrim,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface.tint,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.secondary,
  },
  conditionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  conditionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface.tint,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  notesLabel: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    color: colors.text.tertiary,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  notes: {
    fontSize: typography.size.body,
    color: colors.text.label,
    lineHeight: typography.lineHeight.body,
  },
  notesEmpty: {
    fontSize: typography.size.body,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  deleteButtonText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.error,
  },
});
