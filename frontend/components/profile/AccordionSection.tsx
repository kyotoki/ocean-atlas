import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";

interface AccordionSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  defaultExpanded?: boolean;
  /** Mounts children only after the first expand, instead of always-mounted-but-hidden.
   * Needed for expensive children (e.g. a map) that shouldn't be created while collapsed. */
  lazy?: boolean;
  /** Fires on every expand/collapse. Useful when a child needs to react to its
   * container's visibility changing (e.g. a Leaflet map's invalidateSize). */
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
}

export default function AccordionSection({
  title,
  icon,
  defaultExpanded = false,
  lazy = false,
  onExpandedChange,
  children,
}: AccordionSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [everExpanded, setEverExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState(0);
  const animatedProgress = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      setEverExpanded(true);
    }
    onExpandedChange?.(next);
    Animated.timing(animatedProgress, {
      toValue: next ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    const measured = event.nativeEvent.layout.height;
    if (measured > 0 && measured !== contentHeight) {
      setContentHeight(measured);
    }
  };

  const animatedHeight = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });
  const rotate = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.card}>
      <Pressable onPress={toggle} style={styles.header} hitSlop={4}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name={icon} size={16} color="#0B3D5C" />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={18} color="#5A6B87" />
        </Animated.View>
      </Pressable>

      <Animated.View style={{ height: animatedHeight, overflow: "hidden" }}>
        <View onLayout={onContentLayout} style={styles.contentMeasure}>
          {lazy && !everExpanded ? null : children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EAF6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#101828",
  },
  contentMeasure: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
