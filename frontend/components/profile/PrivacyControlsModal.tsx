import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";

interface PrivacyControlsModalProps {
  visible: boolean;
  onClose: () => void;
}

// These toggles are visual placeholders only - nothing on the backend actually
// enforces map/log visibility yet (there's no follower/social layer in this
// app at all). They're here so the settings surface exists ahead of that
// feature landing, per the "Placeholders for managing..." framing this was
// requested with.
export default function PrivacyControlsModal({ visible, onClose }: PrivacyControlsModalProps) {
  const [publicMap, setPublicMap] = useState(false);
  const [publicLogs, setPublicLogs] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Privacy Controls</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color="#5A6B87" />
            </Pressable>
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Public Ocean Map</Text>
              <Text style={styles.rowSubtext}>Let other divers see your dive pins</Text>
            </View>
            <Switch value={publicMap} onValueChange={setPublicMap} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Public Adventure Log</Text>
              <Text style={styles.rowSubtext}>Let other divers see your logged trips</Text>
            </View>
            <Switch value={publicLogs} onValueChange={setPublicLogs} />
          </View>

          <Text style={styles.note}>
            Sharing between divers isn't available yet - these are early previews of upcoming
            privacy settings.
          </Text>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#101828",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F6FC",
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#101828",
  },
  rowSubtext: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  note: {
    fontSize: 11,
    color: "#94A3B8",
    fontStyle: "italic",
    marginTop: 14,
    lineHeight: 16,
  },
});
