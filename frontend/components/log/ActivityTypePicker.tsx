import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import {
  FIELD_BORDER,
  FIELD_FILL,
  FIELD_PADDING_HORIZONTAL,
  FIELD_PADDING_VERTICAL,
  FIELD_RADIUS,
} from "../../constants/fieldStyle";
import { ActivityType } from "../../types/adventure";

const OPTIONS: { value: ActivityType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "scuba", label: "Scuba Diving", icon: "trending-down-outline" },
  { value: "snorkeling", label: "Snorkeling", icon: "water-outline" },
];

interface ActivityTypePickerProps {
  value: ActivityType;
  onChange: (value: ActivityType) => void;
}

export default function ActivityTypePicker({ value, onChange }: ActivityTypePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Activity Type</Text>
      <Pressable style={styles.field} onPress={() => setIsOpen(true)}>
        <View style={styles.selectedIconBadge}>
          <Ionicons name={selected.icon} size={16} color="#0B3D91" />
        </View>
        <Text style={styles.selectedText}>{selected.label}</Text>
        <Ionicons name="chevron-down" size={18} color="#5A6B87" />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
            {OPTIONS.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 8,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: FIELD_FILL,
    borderWidth: 1.5,
    borderColor: FIELD_BORDER,
    borderRadius: FIELD_RADIUS,
    paddingHorizontal: FIELD_PADDING_HORIZONTAL,
    paddingVertical: FIELD_PADDING_VERTICAL,
  },
  selectedIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EAF6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#101828",
  },
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
