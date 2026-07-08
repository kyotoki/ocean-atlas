import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { colors, elevation, gradients, radius, spacing, typography, withOpacity } from "../../constants/theme";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  featured?: boolean;
}

export default function StatCard({ icon, label, value, featured = false }: StatCardProps) {
  if (featured) {
    return (
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredCard}
      >
        <View style={styles.featuredIconBadge}>
          <Ionicons name={icon} size={22} color={colors.text.inverse} />
        </View>
        <Text style={styles.featuredValue} numberOfLines={1} ellipsizeMode="tail">
          {value}
        </Text>
        <Text style={styles.featuredLabel}>{label}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <Ionicons name={icon} size={18} color={colors.secondary} />
      </View>
      <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    ...elevation.card,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.surface.tint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: typography.tracking.wide,
    marginTop: spacing.xxs,
    textAlign: "center",
  },
  featuredCard: {
    flex: 1,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    ...elevation.floating,
  },
  featuredIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: withOpacity(colors.surface.card, 0.18),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  featuredValue: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    letterSpacing: 0.2,
  },
  featuredLabel: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: withOpacity(colors.text.inverse, 0.85),
    textTransform: "uppercase",
    letterSpacing: typography.tracking.wide,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
