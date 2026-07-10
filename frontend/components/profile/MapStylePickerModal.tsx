import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing, typography } from "../../constants/theme";
import { MapStyle } from "../../contexts/PreferencesContext";

const OPTIONS: { value: MapStyle; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "standard", label: "Standard", icon: "map-outline" },
  { value: "satellite", label: "Satellite", icon: "planet-outline" },
  { value: "hybrid", label: "Hybrid", icon: "layers-outline" },
];

interface MapStylePickerModalProps {
  visible: boolean;
  onClose: () => void;
  value: MapStyle;
  onSelect: (value: MapStyle) => void;
}

export default function MapStylePickerModal({
  visible,
  onClose,
  value,
  onSelect,
}: MapStylePickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Map Style</Text>
          {OPTIONS.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: isSelected }}
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={isSelected ? colors.text.inverse : colors.primary}
                />
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.text.inverse}
                    style={styles.checkmark}
                  />
                )}
              </Pressable>
            );
          })}
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
  menu: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.surface.card,
    borderRadius: radius.xl,
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.text.tertiary,
    letterSpacing: 0.6,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxs,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.text.inverse,
  },
  checkmark: {
    marginLeft: spacing.xs,
  },
});
