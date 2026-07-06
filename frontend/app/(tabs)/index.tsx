import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AdventureDetailModal from "../../components/map/AdventureDetailModal";
import DiveMapView from "../../components/map/DiveMapView";
import MapSkeleton from "../../components/map/MapSkeleton";
import WaveSpinner from "../../components/ui/WaveSpinner";
import { ENDPOINTS } from "../../constants/api";
import { Adventure } from "../../types/adventure";
import { useAuthedFetch } from "../../utils/api";

export default function OceanMapScreen() {
  const authedFetch = useAuthedFetch();
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const [showConditions, setShowConditions] = useState(false);

  const fetchAdventures = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await authedFetch(ENDPOINTS.adventures);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data: Adventure[] = await response.json();
      setAdventures(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reach the Ocean Atlas server."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [authedFetch]);

  useFocusEffect(
    useCallback(() => {
      fetchAdventures();
    }, [fetchAdventures])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <MapSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered} edges={["bottom"]}>
        <Ionicons name="cloud-offline-outline" size={40} color="#B00020" />
        <Text style={styles.errorTitle}>Connection failed</Text>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {adventures.length}{" "}
          {adventures.length === 1 ? "adventure" : "adventures"} logged
        </Text>
        <Pressable
          onPress={() => fetchAdventures(true)}
          disabled={isRefreshing}
          hitSlop={8}
        >
          {isRefreshing ? (
            <WaveSpinner size="small" color="#0B3D91" />
          ) : (
            <Ionicons name="refresh" size={18} color="#0B3D91" />
          )}
        </Pressable>
      </View>

      <View style={styles.mapContainer}>
        <DiveMapView
          adventures={adventures}
          onSelectAdventure={setSelectedAdventure}
          showConditions={showConditions}
        />

        <Pressable
          onPress={() => setShowConditions((prev) => !prev)}
          hitSlop={8}
          style={[styles.conditionsToggle, showConditions && styles.conditionsToggleActive]}
        >
          <Ionicons
            name="thermometer-outline"
            size={16}
            color={showConditions ? "#FFFFFF" : "#0B3D5C"}
          />
          <Text
            style={[
              styles.conditionsToggleText,
              showConditions && styles.conditionsToggleTextActive,
            ]}
          >
            Conditions
          </Text>
        </Pressable>

        {adventures.length === 0 && (
          <View style={styles.emptyOverlay} pointerEvents="none">
            <Ionicons name="boat-outline" size={40} color="#8E8E93" />
            <Text style={styles.emptyText}>
              No dives logged yet. Head to the Log Dive tab to add your first
              adventure.
            </Text>
          </View>
        )}
      </View>

      <AdventureDetailModal
        key={selectedAdventure?.id ?? "none"}
        adventure={selectedAdventure}
        onClose={() => setSelectedAdventure(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F6FC",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5A6B87",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mapContainer: {
    flex: 1,
  },
  conditionsToggle: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  conditionsToggleActive: {
    backgroundColor: "#0B3D5C",
  },
  conditionsToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B3D5C",
  },
  conditionsToggleTextActive: {
    color: "#FFFFFF",
  },
  emptyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#B00020",
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: "#5A6B87",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
});
