import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

import { Adventure } from "../../types/adventure";
import CyanDivePin from "./CyanDivePin";

const WORLD_REGION: Region = {
  latitude: 10,
  longitude: 0,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

interface DiveMapViewProps {
  adventures: Adventure[];
  onSelectAdventure: (adventure: Adventure) => void;
}

export default function DiveMapView({ adventures, onSelectAdventure }: DiveMapViewProps) {
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
      style={StyleSheet.absoluteFill}
      initialRegion={WORLD_REGION}
      showsCompass
      showsScale
      toolbarEnabled={false}
    >
      {adventures.map((adventure) => (
        <Marker
          key={adventure.id}
          coordinate={{ latitude: adventure.latitude, longitude: adventure.longitude }}
          anchor={{ x: 0.5, y: 1 }}
          tracksViewChanges={false}
          onPress={() => onSelectAdventure(adventure)}
        >
          <CyanDivePin />
        </Marker>
      ))}
    </MapView>
  );
}
