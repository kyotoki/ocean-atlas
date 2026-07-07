import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { UnitSystem } from "../../utils/units";
import SegmentedControl from "./SegmentedControl";
import SettingsRow from "./SettingsRow";
import SvelProRow from "./SvelProRow";

const SCREEN_WIDTH = Dimensions.get("window").width;

const UNIT_SYSTEM_OPTIONS = [
  { value: "metric" as const, label: "Metric" },
  { value: "imperial" as const, label: "Imperial" },
];

interface SettingsMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  onManageGear: () => void;
  onOpenSvelPro: () => void;
  onPrivacyControls: () => void;
  onMapPreferences: () => void;
  gearSubtext: string;
  unitSystem: UnitSystem;
  onUnitSystemChange: (value: UnitSystem) => void;
  mapStyleLabel: string;
  onLogOut: () => void;
  appVersion: string;
}

export default function SettingsMenuModal({
  visible,
  onClose,
  onEditProfile,
  onManageGear,
  onOpenSvelPro,
  onPrivacyControls,
  onMapPreferences,
  gearSubtext,
  unitSystem,
  onUnitSystemChange,
  mapStyleLabel,
  onLogOut,
  appVersion,
}: SettingsMenuModalProps) {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 4,
      }).start();
    } else {
      translateX.setValue(SCREEN_WIDTH);
    }
  }, [visible, translateX]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
        <Pressable style={styles.panelInner} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#5A6B87" />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <SettingsRow
            icon="create-outline"
            label="Edit Profile Settings"
            subtext="Name, bio & home country"
            onPress={onEditProfile}
          />
          <SettingsRow
            icon="bag-handle-outline"
            label="Manage Equipment"
            subtext={gearSubtext}
            onPress={onManageGear}
          />

          <SvelProRow onPress={onOpenSvelPro} />

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>APP CUSTOMIZATION</Text>
          <SettingsRow
            icon="thermometer-outline"
            label="Unit Measurements"
            rightElement={
              <View style={styles.unitToggleWrap}>
                <SegmentedControl
                  options={UNIT_SYSTEM_OPTIONS}
                  value={unitSystem}
                  onChange={onUnitSystemChange}
                />
              </View>
            }
          />
          <SettingsRow
            icon="map-outline"
            label="Map Preferences"
            subtext={mapStyleLabel}
            onPress={onMapPreferences}
          />

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>PRIVACY</Text>
          <SettingsRow
            icon="lock-closed-outline"
            label="Privacy Controls"
            subtext="Manage who can see your map & logs"
            onPress={onPrivacyControls}
          />

          <View style={styles.spacer} />

          <View style={styles.bottomAnchor}>
            <Pressable style={styles.logOutButton} onPress={onLogOut}>
              <Ionicons name="log-out-outline" size={17} color="#FFFFFF" />
              <Text style={styles.logOutButtonText}>Log Out</Text>
            </Pressable>
            <Text style={styles.versionText}>Svel v{appVersion} (Production Build)</Text>
          </View>
        </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "rgba(4, 20, 35, 0.55)",
  },
  panel: {
    width: "82%",
    maxWidth: 340,
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: "#021019",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  panelInner: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101828",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 4,
  },
  sectionLabelSpaced: {
    marginTop: 18,
  },
  unitToggleWrap: {
    width: 150,
  },
  spacer: {
    flex: 1,
  },
  bottomAnchor: {
    paddingTop: 12,
  },
  logOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#B00020",
    borderRadius: 14,
    paddingVertical: 13,
  },
  logOutButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  versionText: {
    fontSize: 11,
    color: "#B7C2D0",
    textAlign: "center",
    marginTop: 10,
  },
});
