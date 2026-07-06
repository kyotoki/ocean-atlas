import { StyleSheet, Text, View } from "react-native";

export const DIVE_PIN_CYAN = "#06B6D4";

export default function CyanDivePin() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.circle}>
        <Text style={styles.emoji}>🤿</Text>
      </View>
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DIVE_PIN_CYAN,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
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
    borderTopColor: DIVE_PIN_CYAN,
    marginTop: -2,
  },
});
