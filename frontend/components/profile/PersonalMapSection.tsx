import { StyleSheet, View } from "react-native";

import { radius } from "../../constants/theme";
import { Adventure } from "../../types/adventure";
import DiveMapView from "../map/DiveMapView";
import AccordionSection from "./AccordionSection";

interface PersonalMapSectionProps {
  adventures: Adventure[];
  onSelectAdventure: (adventure: Adventure) => void;
  isMapExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export default function PersonalMapSection({
  adventures,
  onSelectAdventure,
  isMapExpanded,
  onExpandedChange,
}: PersonalMapSectionProps) {
  return (
    <AccordionSection title="Personal Ocean Map" icon="map-outline" lazy onExpandedChange={onExpandedChange}>
      <View style={styles.miniMapWrap}>
        <DiveMapView
          adventures={adventures}
          onSelectAdventure={onSelectAdventure}
          invalidateSizeTrigger={isMapExpanded}
        />
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
});
