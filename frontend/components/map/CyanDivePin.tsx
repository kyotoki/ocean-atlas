import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { getActivityTypeOption } from "../../constants/activityTypes";
import { colors, radius, spacing, typography, withOpacity } from "../../constants/theme";
import { ActivityType } from "../../types/adventure";

interface CyanDivePinProps {
  activityType: ActivityType;
  badgeText?: string;
  /** True while this adventure's detail modal is open, for a brief visual
   * "you tapped this one" state - useful once several pins sit close
   * together. */
  isSelected?: boolean;
}

export default function CyanDivePin({ activityType, badgeText, isSelected = false }: CyanDivePinProps) {
  const { markerEmoji, color } = getActivityTypeOption(activityType);

  return (
    <View style={styles.wrapper}>
      {badgeText ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {badgeText}
          </Text>
        </View>
      ) : null}
      {/* Padded on every side but the bottom, so the tappable region is
       * comfortably bigger than the visual glyph without shifting the
       * anchored point, which sits at this view's bottom-center (the tail
       * tip) via the parent Marker's anchor={{x:0.5,y:1}}. */}
      <View style={styles.hitArea}>
        <View style={styles.pinBody}>
          <View
            style={[
              styles.glow,
              isSelected && styles.glowSelected,
              { backgroundColor: withOpacity(color, isSelected ? 0.4 : 0.25) },
            ]}
          />
          <LinearGradient
            colors={[color, colors.secondary]}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={[styles.circle, isSelected && styles.circleSelected]}
          >
            <Text style={styles.emoji}>{markerEmoji}</Text>
          </LinearGradient>
          <View style={styles.tail} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  badge: {
    backgroundColor: colors.secondary,
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
  hitArea: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
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
  },
  glowSelected: {
    top: -7,
    width: 46,
    height: 46,
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
  // Border thickness only, deliberately not a width/height change - growing
  // the circle's own box would push the tail down in flow layout (a taller
  // flex child grows downward from its own top, not centered), which would
  // visibly shift the pin away from its anchored coordinate. The enlarged
  // glow above is absolutely positioned, so resizing that carries no such
  // risk and does the visual "selected" lift on its own.
  circleSelected: {
    borderWidth: 3,
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
    borderTopColor: colors.secondary,
    marginTop: -2,
  },
});
