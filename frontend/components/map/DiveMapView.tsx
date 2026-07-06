import { useEffect, useRef } from "react";
import { Platform, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

import { usePreferences } from "../../contexts/PreferencesContext";
import { Adventure } from "../../types/adventure";
import { formatConditionsBadge } from "../../utils/mapConditions";
import CyanDivePin from "./CyanDivePin";

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
}: DiveMapViewProps) {
  const { mapStyle } = usePreferences();
  const mapRef = useRef<MapView>(null);

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
    <MapView
      ref={mapRef}
      provider={MAP_PROVIDER}
      mapType={mapStyle}
      style={StyleSheet.absoluteFill}
      initialRegion={WORLD_REGION}
      showsCompass
      showsScale
      toolbarEnabled={false}
    >
      {adventures.map((adventure) => {
        const badgeText = showConditions ? formatConditionsBadge(adventure) : undefined;
        return (
          <Marker
            // Remounting on showConditions flips forces react-native-maps to
            // re-snapshot the marker bitmap - with tracksViewChanges=false the
            // native layer otherwise caches the old snapshot indefinitely.
            key={`${adventure.id}-${showConditions}`}
            coordinate={{ latitude: adventure.latitude, longitude: adventure.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={showConditions}
            onPress={() => onSelectAdventure(adventure)}
          >
            <CyanDivePin badgeText={badgeText} />
          </Marker>
        );
      })}
    </MapView>
  );
}
