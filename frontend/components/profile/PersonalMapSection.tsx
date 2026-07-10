import { StyleSheet, View } from "react-native";

import { colors, radius } from "../../constants/theme";
import { Adventure } from "../../types/adventure";
import DiveMapView from "../map/DiveMapView";
import EmptyState from "../ui/EmptyState";
import AccordionSection from "./AccordionSection";

interface PersonalMapSectionProps {
  adventures: Adventure[];
  onSelectAdventure: (adventure: Adventure) => void;
  isMapExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  selectedAdventureId?: number | null;
  onLogAdventure: () => void;
}

export default function PersonalMapSection({
  adventures,
  onSelectAdventure,
  isMapExpanded,
  onExpandedChange,
  selectedAdventureId = null,
  onLogAdventure,
}: PersonalMapSectionProps) {
  return (
    <AccordionSection title="Personal Ocean Map" icon="map-outline" lazy onExpandedChange={onExpandedChange}>
      <View style={styles.miniMapWrap}>
        {adventures.length > 0 ? (
          <DiveMapView
            adventures={adventures}
            onSelectAdventure={onSelectAdventure}
            invalidateSizeTrigger={isMapExpanded}
            selectedAdventureId={selectedAdventureId}
          />
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState
              size="compact"
              icon={{ emoji: "🗺️" }}
              title="Your map is empty"
              message="Log your first dive, snorkel, or freedive to start charting your footprint."
              action={{ label: "Log Adventure", onPress: onLogAdventure }}
            />
          </View>
        )}
      </View>
    </AccordionSection>
  );
}

const styles = StyleSheet.create({
  miniMapWrap: {
    height: 260,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  emptyWrap: {
    flex: 1,
    backgroundColor: colors.surface.tint,
  },
});
