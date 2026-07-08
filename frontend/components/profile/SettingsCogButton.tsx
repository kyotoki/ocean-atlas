import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { colors, radius, withOpacity } from "../../constants/theme";

interface SettingsCogButtonProps {
  onPress: () => void;
}

export default function SettingsCogButton({ onPress }: SettingsCogButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.88)}
        onPressOut={() => animateTo(1)}
        hitSlop={10}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
      >
        <Ionicons name="settings-outline" size={20} color={colors.text.inverse} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: withOpacity(colors.surface.card, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(colors.surface.card, 0.22),
    alignItems: "center",
    justifyContent: "center",
  },
});
