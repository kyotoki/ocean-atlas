import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import Skeleton from "../ui/Skeleton";
import WaveSpinner from "../ui/WaveSpinner";

const PIN_PLACEHOLDERS: { top: `${number}%`; left: `${number}%`; size: number }[] = [
  { top: "28%", left: "22%", size: 22 },
  { top: "46%", left: "62%", size: 30 },
  { top: "64%", left: "36%", size: 18 },
  { top: "22%", left: "72%", size: 16 },
];

export default function MapSkeleton() {
  return (
    <LinearGradient colors={["#02101F", "#062C43", "#0B3D5C"]} style={styles.fill}>
      {PIN_PLACEHOLDERS.map((pin, index) => (
        <Skeleton
          key={index}
          baseColor="rgba(6, 182, 212, 0.28)"
          style={[
            styles.pin,
            {
              top: pin.top,
              left: pin.left,
              width: pin.size,
              height: pin.size,
              borderRadius: pin.size / 2,
            },
          ]}
        />
      ))}

      <View style={styles.caption}>
        <WaveSpinner size="large" />
        <Text style={styles.captionText}>Charting your dives...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    position: "absolute",
  },
  caption: {
    alignItems: "center",
    gap: 14,
  },
  captionText: {
    color: "#8FB8CE",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
