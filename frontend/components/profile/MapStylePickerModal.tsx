import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text } from "react-native";

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
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={isSelected ? "#FFFFFF" : "#0B3D91"}
                />
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" style={styles.checkmark} />
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
    backgroundColor: "rgba(4, 20, 35, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  menu: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.6,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionSelected: {
    backgroundColor: "#0B3D91",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#101828",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  checkmark: {
    marginLeft: 6,
  },
});
