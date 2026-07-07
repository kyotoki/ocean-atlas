import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface PhotoCarouselProps {
  photos: string[];
  height: number;
}

export default function PhotoCarousel({ photos, height }: PhotoCarouselProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!containerWidth) {
      return;
    }
    const index = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
    setActiveIndex(index);
  };

  if (photos.length === 0) {
    return (
      <View style={[styles.photo, styles.photoPlaceholder, { height }]}>
        <Ionicons name="image-outline" size={32} color="#94A3B8" />
        <Text style={styles.photoPlaceholderText}>No photo added</Text>
      </View>
    );
  }

  return (
    <View style={{ height }} onLayout={onLayout}>
      {containerWidth > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {photos.map((url, index) =>
            failedIndices[index] ? (
              <View
                key={url}
                style={[styles.photo, styles.photoPlaceholder, { width: containerWidth, height }]}
              >
                <Ionicons name="image-outline" size={32} color="#94A3B8" />
                <Text style={styles.photoPlaceholderText}>Photo unavailable</Text>
              </View>
            ) : (
              <Image
                key={url}
                source={{ uri: url }}
                style={{ width: containerWidth, height }}
                resizeMode="cover"
                onError={() => setFailedIndices((prev) => ({ ...prev, [index]: true }))}
              />
            )
          )}
        </ScrollView>
      )}
      {photos.length > 1 && (
        <View style={styles.dotsRow} pointerEvents="none">
          {photos.map((_, index) => (
            <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },
  dotsRow: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
    width: 16,
  },
});
