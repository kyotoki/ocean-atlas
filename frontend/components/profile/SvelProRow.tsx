import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SvelProRowProps {
  onPress: () => void;
}

export default function SvelProRow({ onPress }: SvelProRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <LinearGradient
        colors={["#0B3D5C", "#3E2E05", "#8A6300"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconBadge}>
          <Ionicons name="star" size={17} color="#FFD873" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.label}>Svel Pro Membership</Text>
          <Text style={styles.subtext}>Unlock the full ocean experience</Text>
        </View>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginVertical: 4,
    shadowColor: "#8A6300",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 216, 115, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 216, 115, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  subtext: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 232, 189, 0.85)",
    marginTop: 2,
  },
  proBadge: {
    backgroundColor: "#FFD873",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#3E2E05",
    letterSpacing: 0.6,
  },
});
