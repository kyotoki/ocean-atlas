import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, StyleSheet } from "react-native";

export default function OceanLoadingScreen() {
  return (
    <LinearGradient colors={["#02101F", "#062C43", "#0B3D5C"]} style={styles.gradient}>
      <ActivityIndicator size="large" color="#06B6D4" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
