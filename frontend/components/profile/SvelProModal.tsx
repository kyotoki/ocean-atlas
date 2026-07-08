import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, gradients, radius, spacing, typography, withOpacity } from "../../constants/theme";

interface SvelProModalProps {
  visible: boolean;
  onClose: () => void;
}

const FREE_FEATURES = [
  "Basic adventure logging",
  "Standard map views",
  "Basic stats tracking",
];

const PRO_FEATURES = [
  "Advanced Marine Weather & Tide overlays",
  "Unlimited Gear wear-and-tear tracking",
  "Custom Map styles (Satellite/Hybrid)",
  "Premium social sharing graphics cards",
];

export default function SvelProModal({ visible, onClose }: SvelProModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <LinearGradient colors={gradients.deepOcean} style={styles.hero}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.text.inverse} />
          </Pressable>
          <View style={styles.heroIconBadge}>
            <Ionicons name="star" size={28} color={colors.premium} />
          </View>
          <Text style={styles.heroTitle}>Svel Pro</Text>
          <Text style={styles.heroTagline}>Unlock the full ocean experience</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tierCard}>
            <Text style={styles.tierLabel}>FREE VERSION</Text>
            {FREE_FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.text.tertiary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <LinearGradient
            colors={[colors.secondary, colors.premiumTextStrong, colors.premiumText]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tierCardPro}
          >
            <View style={styles.proTierHeader}>
              <Ionicons name="star" size={16} color={colors.premium} />
              <Text style={styles.tierLabelPro}>SVEL PRO UPGRADE</Text>
            </View>
            {PRO_FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.premium} />
                <Text style={styles.featureTextPro}>{feature}</Text>
              </View>
            ))}
          </LinearGradient>
        </ScrollView>

        <View style={styles.ctaWrap}>
          <Pressable style={styles.ctaButton} disabled accessibilityState={{ disabled: true }}>
            <Ionicons name="lock-closed-outline" size={16} color={withOpacity(colors.text.inverse, 0.7)} />
            <Text style={styles.ctaButtonText}>Upgrade to Pro — Coming Soon</Text>
          </Pressable>
          <Text style={styles.ctaNote}>Premium subscriptions aren't available yet.</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.page,
  },
  hero: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  closeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: withOpacity(colors.surface.card, 0.14),
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: withOpacity(colors.premium, 0.16),
    borderWidth: 1,
    borderColor: withOpacity(colors.premium, 0.4),
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.size.headline,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    letterSpacing: 0.3,
  },
  heroTagline: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.inverseStrong,
    marginTop: spacing.xxs,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  tierCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    // One-off card shadow (opacity/elevation don't match the standard "card"
    // preset) - only the color is shared with the rest of the app.
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  tierCardPro: {
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    // One-off glow shadow tied to the premium gold color.
    shadowColor: colors.premiumText,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  proTierHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  tierLabel: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    color: colors.text.tertiary,
    letterSpacing: 0.8,
  },
  tierLabelPro: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    color: colors.premium,
    letterSpacing: 0.8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.label,
  },
  featureTextPro: {
    flex: 1,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  ctaWrap: {
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.text.secondary,
    opacity: 0.6,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  ctaButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  ctaNote: {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
});
