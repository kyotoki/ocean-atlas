import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "../../constants/theme";

export const DIVE_PIN_CYAN = colors.accent;
export const DIVE_PIN_DEEP = colors.secondary;

interface CyanDivePinProps {
  badgeText?: string;
}

export default function CyanDivePin({ badgeText }: CyanDivePinProps) {
  return (
    <View style={styles.wrapper}>
      {badgeText ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {badgeText}
          </Text>
        </View>
      ) : null}
      <View style={styles.pinBody}>
        <View style={styles.glow} />
        <LinearGradient
          colors={[DIVE_PIN_CYAN, DIVE_PIN_DEEP]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.circle}
        >
          <Text style={styles.emoji}>🤿</Text>
        </LinearGradient>
        <View style={styles.tail} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  badge: {
    backgroundColor: DIVE_PIN_DEEP,
    borderWidth: 1,
    borderColor: withOpacity(colors.surface.card, 0.5),
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    marginBottom: spacing.xxs,
    maxWidth: 64,
    // A small, one-off "pin badge" shadow that doesn't correspond to any of
    // the standard elevation presets - only the color is shared with them.
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.2,
  },
  pinBody: {
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    top: -3,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: withOpacity(colors.accent, 0.25),
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.surface.card,
    alignItems: "center",
    justifyContent: "center",
    // Also a one-off shadow, distinct from the standard elevation presets.
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  emoji: {
    fontSize: typography.size.body,
    lineHeight: 17,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: DIVE_PIN_DEEP,
    marginTop: -2,
  },
});
