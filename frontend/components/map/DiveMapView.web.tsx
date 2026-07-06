import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { View } from "react-native";

import { Adventure } from "../../types/adventure";

const DIVE_PIN_CYAN = "#06B6D4";
const WORLD_CENTER: [number, number] = [10, 0];
const WORLD_ZOOM = 2;

const cyanDiveIcon = L.divIcon({
  className: "ocean-atlas-dive-pin",
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        width:28px;height:28px;border-radius:50%;
        background:${DIVE_PIN_CYAN};border:2px solid #FFFFFF;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 4px rgba(0,0,0,0.35);
        font-size:13px;line-height:1;
      ">🤿</div>
      <div style="
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:7px solid ${DIVE_PIN_CYAN};
        margin-top:-2px;
      "></div>
    </div>
  `,
  iconSize: [32, 38],
  iconAnchor: [16, 38],
  popupAnchor: [0, -36],
});

function FitToMarkers({ adventures }: { adventures: Adventure[] }) {
  const map = useMap();

  useEffect(() => {
    if (adventures.length === 0) {
      return;
    }

    if (adventures.length === 1) {
      map.setView([adventures[0].latitude, adventures[0].longitude], 10, {
        animate: true,
      });
      return;
    }

    const bounds = L.latLngBounds(
      adventures.map((a) => [a.latitude, a.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
  }, [adventures, map]);

  return null;
}

interface DiveMapViewProps {
  adventures: Adventure[];
  onSelectAdventure: (adventure: Adventure) => void;
}

export default function DiveMapView({ adventures, onSelectAdventure }: DiveMapViewProps) {
  return (
    <View style={{ flex: 1 }}>
      <MapContainer
        center={WORLD_CENTER}
        zoom={WORLD_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToMarkers adventures={adventures} />
        {adventures.map((adventure) => (
          <Marker
            key={adventure.id}
            position={[adventure.latitude, adventure.longitude]}
            icon={cyanDiveIcon}
            eventHandlers={{ click: () => onSelectAdventure(adventure) }}
          />
        ))}
      </MapContainer>
    </View>
  );
}
