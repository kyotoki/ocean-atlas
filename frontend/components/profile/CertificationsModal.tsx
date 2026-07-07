import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { CERTIFICATIONS } from "../../utils/certifications";

interface CertificationsModalProps {
  visible: boolean;
  onClose: () => void;
  certifications: string[];
  onToggle: (value: string) => void;
}

export default function CertificationsModal({
  visible,
  onClose,
  certifications,
  onToggle,
}: CertificationsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>My Certifications & Licenses</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color="#5A6B87" />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            Check off your real-world diving credentials to unlock certification badges.
          </Text>

          {CERTIFICATIONS.map((cert) => {
            const checked = certifications.includes(cert.value);
            return (
              <Pressable
                key={cert.value}
                style={styles.row}
                onPress={() => onToggle(cert.value)}
              >
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.rowLabel}>{cert.label}</Text>
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
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#101828",
    flex: 1,
    marginRight: 12,
  },
  subtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 14,
    lineHeight: 17,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F6FC",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D0D9E6",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0B3D91",
    borderColor: "#0B3D91",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
  },
});
