import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        <LinearGradient colors={["#02101F", "#062C43", "#0B3D5C"]} style={styles.hero}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.heroIconBadge}>
            <Ionicons name="star" size={28} color="#FFD873" />
          </View>
          <Text style={styles.heroTitle}>Svel Pro</Text>
          <Text style={styles.heroTagline}>Unlock the full ocean experience</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tierCard}>
            <Text style={styles.tierLabel}>FREE VERSION</Text>
            {FREE_FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#94A3B8" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <LinearGradient
            colors={["#0B3D5C", "#3E2E05", "#8A6300"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tierCardPro}
          >
            <View style={styles.proTierHeader}>
              <Ionicons name="star" size={16} color="#FFD873" />
              <Text style={styles.tierLabelPro}>SVEL PRO UPGRADE</Text>
            </View>
            {PRO_FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#FFD873" />
                <Text style={styles.featureTextPro}>{feature}</Text>
              </View>
            ))}
          </LinearGradient>
        </ScrollView>

        <View style={styles.ctaWrap}>
          <Pressable style={styles.ctaButton} disabled accessibilityState={{ disabled: true }}>
            <Ionicons name="lock-closed-outline" size={16} color="rgba(255,255,255,0.7)" />
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
    backgroundColor: "#F2F6FC",
  },
  hero: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 216, 115, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 216, 115, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  heroTagline: {
    fontSize: 13,
    fontWeight: "600",
    color: "#C7DCE8",
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  tierCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  tierCardPro: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: "#8A6300",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  proTierHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  tierLabelPro: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFD873",
    letterSpacing: 0.8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  featureTextPro: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ctaWrap: {
    padding: 16,
    paddingTop: 8,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#5A6B87",
    opacity: 0.6,
    borderRadius: 14,
    paddingVertical: 15,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ctaNote: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});
