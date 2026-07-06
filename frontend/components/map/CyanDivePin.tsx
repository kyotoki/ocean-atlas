import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export const DIVE_PIN_CYAN = "#06B6D4";
export const DIVE_PIN_DEEP = "#0B3D5C";

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
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
    maxWidth: 64,
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
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
    borderRadius: 19,
    backgroundColor: "rgba(6, 182, 212, 0.25)",
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  emoji: {
    fontSize: 15,
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
