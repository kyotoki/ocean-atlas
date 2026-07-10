import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "../../constants/theme";

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
      accessibilityRole={onPress ? "button" : undefined}
    >
      <View style={[styles.iconBadge, highlighted && styles.iconBadgeHighlighted]}>
        <Ionicons name={icon} size={17} color={highlighted ? colors.text.inverse : colors.secondary} />
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
            color={highlighted ? withOpacity(colors.text.inverse, 0.8) : colors.text.tertiary}
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
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  rowHighlighted: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    marginVertical: spacing.xxs,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.surface.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeHighlighted: {
    backgroundColor: withOpacity(colors.surface.card, 0.18),
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  labelHighlighted: {
    color: colors.text.inverse,
  },
  subtext: {
    fontSize: typography.size.small,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
  },
  subtextHighlighted: {
    color: withOpacity(colors.text.inverse, 0.75),
  },
});
