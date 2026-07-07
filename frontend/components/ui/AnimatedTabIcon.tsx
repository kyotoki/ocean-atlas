import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const ACTIVE_COLOR = "#0B3D91";
const INACTIVE_COLOR = "#94A3B8";

interface AnimatedTabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  size: number;
}

export default function AnimatedTabIcon({ name, focused, size }: AnimatedTabIconProps) {
  const scale = useRef(new Animated.Value(focused ? 1.15 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 140,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={size} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
    </Animated.View>
  );
}
