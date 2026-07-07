import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

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
        colors={["#0B3D91", "#1668C1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredCard}
      >
        <View style={styles.featuredIconBadge}>
          <Ionicons name={icon} size={22} color="#FFFFFF" />
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
        <Ionicons name={icon} size={18} color="#0B3D5C" />
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF6FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    color: "#101828",
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#5A6B87",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 4,
    textAlign: "center",
  },
  featuredCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  featuredIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featuredValue: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  featuredLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: "center",
  },
});
