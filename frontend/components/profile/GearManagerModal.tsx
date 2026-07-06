import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Adventure } from "../../types/adventure";
import { computeGearUsage } from "../../utils/gearUsage";
import { GearItem } from "../../utils/profileStorage";

const GEAR_TYPES: { value: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "wetsuit", label: "Wetsuit", icon: "body-outline" },
  { value: "fins", label: "Fins", icon: "footsteps-outline" },
  { value: "regulator", label: "Regulator", icon: "pulse-outline" },
  { value: "computer", label: "Dive Computer", icon: "watch-outline" },
  { value: "mask", label: "Mask / Snorkel", icon: "glasses-outline" },
  { value: "other", label: "Other", icon: "construct-outline" },
];

function iconForType(type: string): keyof typeof Ionicons.glyphMap {
  return GEAR_TYPES.find((t) => t.value === type)?.icon ?? "construct-outline";
}

function labelForType(type: string): string {
  return GEAR_TYPES.find((t) => t.value === type)?.label ?? "Other";
}

interface GearManagerModalProps {
  visible: boolean;
  onClose: () => void;
  gear: GearItem[];
  adventures: Adventure[];
  onUpdate: (gear: GearItem[]) => void;
}

export default function GearManagerModal({
  visible,
  onClose,
  gear,
  adventures,
  onUpdate,
}: GearManagerModalProps) {
  const [nameDraft, setNameDraft] = useState("");
  const [typeDraft, setTypeDraft] = useState(GEAR_TYPES[0].value);

  const addGear = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      return;
    }
    onUpdate([...gear, { id: `${Date.now()}`, name: trimmed, type: typeDraft }]);
    setNameDraft("");
  };

  const removeGear = (id: string) => {
    onUpdate(gear.filter((item) => item.id !== id));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Manage Equipment</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color="#5A6B87" />
            </Pressable>
          </View>

          <FlatList
            data={gear}
            keyExtractor={(item) => item.id}
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No gear added yet. Add your wetsuit, fins, or computer below.
              </Text>
            }
            renderItem={({ item }) => {
              const usage = computeGearUsage(item.name, adventures);
              return (
                <View style={styles.gearRow}>
                  <View style={styles.gearIconBadge}>
                    <Ionicons name={iconForType(item.type)} size={18} color="#0B3D5C" />
                  </View>
                  <View style={styles.gearInfo}>
                    <Text style={styles.gearName}>{item.name}</Text>
                    <Text style={styles.gearSubtext}>
                      {labelForType(item.type)} · Used on {usage.tripCount}{" "}
                      {usage.tripCount === 1 ? "adventure" : "adventures"}
                      {usage.tripCount > 0
                        ? ` · ${(usage.totalMinutes / 60).toFixed(1)} hrs`
                        : ""}
                    </Text>
                  </View>
                  <Pressable onPress={() => removeGear(item.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color="#B00020" />
                  </Pressable>
                </View>
              );
            }}
          />

          <Text style={styles.label}>ADD GEAR</Text>
          <View style={styles.typeRow}>
            {GEAR_TYPES.map((type) => {
              const selected = typeDraft === type.value;
              return (
                <Pressable
                  key={type.value}
                  onPress={() => setTypeDraft(type.value)}
                  style={[styles.typeChip, selected && styles.typeChipSelected]}
                >
                  <Ionicons name={type.icon} size={14} color={selected ? "#FFFFFF" : "#0B3D5C"} />
                </Pressable>
              );
            })}
          </View>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder={`e.g. ${labelForType(typeDraft)} name`}
              placeholderTextColor="#A0AEC0"
              value={nameDraft}
              onChangeText={setNameDraft}
              onSubmitEditing={addGear}
            />
            <Pressable style={styles.addButton} onPress={addGear} hitSlop={8}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
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
    backgroundColor: "rgba(4, 20, 35, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#101828",
  },
  list: {
    flexGrow: 0,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: 20,
  },
  gearRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F6FC",
  },
  gearIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  gearInfo: {
    flex: 1,
  },
  gearName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#101828",
  },
  gearSubtext: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  typeChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  typeChipSelected: {
    backgroundColor: "#0B3D5C",
  },
  addRow: {
    flexDirection: "row",
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: "#F2F6FC",
    borderWidth: 1,
    borderColor: "#D0D9E6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#101828",
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#0B3D91",
    alignItems: "center",
    justifyContent: "center",
  },
});
