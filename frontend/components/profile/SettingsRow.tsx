import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtext?: string;
  onPress?: () => void;
  highlighted?: boolean;
  /** Replaces the trailing chevron with custom content (e.g. an inline toggle). */
  rightElement?: ReactNode;
}

export default function SettingsRow({
  icon,
  label,
  subtext,
  onPress,
  highlighted = false,
  rightElement,
}: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, highlighted && styles.rowHighlighted]}
      disabled={!onPress}
    >
      <View style={[styles.iconBadge, highlighted && styles.iconBadgeHighlighted]}>
        <Ionicons name={icon} size={17} color={highlighted ? "#FFFFFF" : "#0B3D5C"} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, highlighted && styles.labelHighlighted]}>{label}</Text>
        {subtext ? (
          <Text style={[styles.subtext, highlighted && styles.subtextHighlighted]}>
            {subtext}
          </Text>
        ) : null}
      </View>
      {rightElement ?? (
        onPress ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={highlighted ? "rgba(255,255,255,0.8)" : "#94A3B8"}
          />
        ) : null
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowHighlighted: {
    backgroundColor: "#0B3D91",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeHighlighted: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#101828",
  },
  labelHighlighted: {
    color: "#FFFFFF",
  },
  subtext: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  subtextHighlighted: {
    color: "rgba(255,255,255,0.75)",
  },
});
