import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const DIVE_CYAN = "#06B6D4";

interface WaveSpinnerProps {
  size?: "small" | "large";
  color?: string;
}

const DOT_COUNT = 3;

export default function WaveSpinner({ size = "large", color = DIVE_CYAN }: WaveSpinnerProps) {
  const dotSize = size === "small" ? 6 : 10;
  const gap = size === "small" ? 5 : 8;
  const values = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 140),
          Animated.timing(value, {
            toValue: 1,
            duration: 420,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 420,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay((DOT_COUNT - 1 - index) * 140),
        ])
      )
    );

    Animated.stagger(0, animations).start();

    return () => animations.forEach((animation) => animation.stop());
  }, [values]);

  return (
    <View style={[styles.row, { gap }]}>
      {values.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
              opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              transform: [
                {
                  scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {},
});
