import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../../constants/theme";
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
              <Ionicons name="close" size={22} color={colors.text.secondary} />
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
              <Ionicons name="log-out-outline" size={17} color={colors.text.inverse} />
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
    backgroundColor: colors.overlay.modalScrim,
  },
  panel: {
    width: "82%",
    maxWidth: 340,
    height: "100%",
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: radius.xxl,
    borderBottomLeftRadius: radius.xxl,
    // One-off drawer shadow (negative horizontal offset, doesn't match any
    // standard elevation preset) - only the color is shared with them.
    shadowColor: colors.shadowColor,
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  panelInner: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.subtitle,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  sectionLabel: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    color: colors.text.tertiary,
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xxs,
  },
  sectionLabelSpaced: {
    marginTop: spacing.lg,
  },
  unitToggleWrap: {
    width: 150,
  },
  spacer: {
    flex: 1,
  },
  bottomAnchor: {
    paddingTop: spacing.sm,
  },
  logOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
  },
  logOutButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  versionText: {
    fontSize: typography.size.caption,
    color: colors.text.disabled,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
