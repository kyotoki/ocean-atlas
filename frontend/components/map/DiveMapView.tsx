import { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import ClusterMapView from "react-native-map-clustering";

import { colors } from "../../constants/theme";
import { usePreferences } from "../../contexts/PreferencesContext";
import { Adventure } from "../../types/adventure";
import { formatConditionsBadge } from "../../utils/mapConditions";
import CyanDivePin from "./CyanDivePin";
import MapLegend from "./MapLegend";

// Android only ships Google Maps here (app.config.js wires up the Android Maps
// API key), so pin the provider explicitly rather than relying on react-native-maps'
// implicit per-platform default. iOS keeps Apple Maps (PROVIDER_DEFAULT) since we
// don't have an iOS Google Maps API key configured - forcing PROVIDER_GOOGLE there
// would render a blank map.
//
// Label language: neither Apple MapKit nor the Google Maps SDK exposes a
// per-instance "language" override, and react-native-maps doesn't add one either
// (there's no such prop in its API) - both already read the device's system
// locale automatically. When a place has no translated name for that locale in
// the map provider's data, it falls back to the local name; that's a map-data
// gap, not something an app-level config can override.
const MAP_PROVIDER = Platform.OS === "android" ? PROVIDER_GOOGLE : undefined;

const WORLD_REGION: Region = {
  latitude: 10,
  longitude: 0,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

interface DiveMapViewProps {
  adventures: Adventure[];
  onSelectAdventure: (adventure: Adventure) => void;
  showConditions?: boolean;
  /** The currently-open adventure's id (the caller already tracks this to
   * drive AdventureDetailModal) - passed back in as a controlled value
   * rather than duplicated as separate state here, so the pin's "selected"
   * look correctly clears the moment the caller's modal closes, instead of
   * going stale. */
  selectedAdventureId?: number | null;
  /** No-op here - only meaningful for the web/Leaflet variant (see
   * DiveMapView.web.tsx). Native map views resize themselves normally, so
   * there's nothing to invalidate. Kept in the shared prop shape so callers
   * don't need platform-specific branching. */
  invalidateSizeTrigger?: unknown;
}

export default function DiveMapView({
  adventures,
  onSelectAdventure,
  showConditions = false,
  selectedAdventureId = null,
}: DiveMapViewProps) {
  const { mapStyle } = usePreferences();
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (adventures.length === 0 || !mapRef.current) {
      return;
    }

    if (adventures.length === 1) {
      mapRef.current.animateToRegion(
        {
          latitude: adventures[0].latitude,
          longitude: adventures[0].longitude,
          latitudeDelta: 8,
          longitudeDelta: 8,
        },
        500
      );
      return;
    }

    mapRef.current.fitToCoordinates(
      adventures.map((a) => ({ latitude: a.latitude, longitude: a.longitude })),
      {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      }
    );
  }, [adventures]);

  return (
    <View style={styles.flex}>
      <ClusterMapView
        // Community type declarations for this prop are imprecise (typed as
        // React.Ref<Map> when in practice it just hands back the instance) -
        // `any` sidesteps that rather than fighting a third-party .d.ts.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapRef={(ref: any) => {
          mapRef.current = ref;
        }}
        provider={MAP_PROVIDER}
        mapType={mapStyle}
        style={StyleSheet.absoluteFill}
        initialRegion={WORLD_REGION}
        showsCompass
        showsScale
        toolbarEnabled={false}
        clusterColor={colors.primary}
        clusterTextColor={colors.text.inverse}
      >
        {adventures.map((adventure) => {
          const badgeText = showConditions ? formatConditionsBadge(adventure) : undefined;
          const isSelected = adventure.id === selectedAdventureId;
          return (
            <Marker
              // Remounting on showConditions/isSelected flips forces
              // react-native-maps to re-snapshot the marker bitmap - with
              // tracksViewChanges=false the native layer otherwise caches the
              // old snapshot indefinitely.
              key={`${adventure.id}-${showConditions}-${isSelected}`}
              coordinate={{ latitude: adventure.latitude, longitude: adventure.longitude }}
              anchor={{ x: 0.5, y: 1 }}
              tracksViewChanges={showConditions || isSelected}
              onPress={() => onSelectAdventure(adventure)}
            >
              <CyanDivePin
                activityType={adventure.activity_type}
                badgeText={badgeText}
                isSelected={isSelected}
              />
            </Marker>
          );
        })}
      </ClusterMapView>
      {adventures.length > 0 && <MapLegend />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
