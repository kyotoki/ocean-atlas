import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { View } from "react-native";

import { usePreferences } from "../../contexts/PreferencesContext";
import { Adventure } from "../../types/adventure";
import { formatConditionsBadge } from "../../utils/mapConditions";

const DIVE_PIN_CYAN = "#06B6D4";
const DIVE_PIN_DEEP = "#0B3D5C";
const WORLD_CENTER: [number, number] = [10, 0];
const WORLD_ZOOM = 2;

const PIN_HEIGHT = 38;
const BADGE_HEIGHT = 20;

// Built per-marker (rather than a single shared constant) since the badge
// makes each icon's content - and therefore its height/anchor - depend on
// that specific adventure's conditions. The badge sits above the circle so
// the tail tip (the actual anchored point) never moves.
function buildDiveIcon(badgeText?: string) {
  const totalHeight = PIN_HEIGHT + (badgeText ? BADGE_HEIGHT : 0);
  const badgeHtml = badgeText
    ? `<div style="
        background:${DIVE_PIN_DEEP};color:#FFFFFF;font-size:10px;font-weight:800;
        letter-spacing:0.2px;white-space:nowrap;border-radius:8px;
        border:1px solid rgba(255,255,255,0.5);padding:2px 6px;margin-bottom:4px;
        box-shadow:0 2px 3px rgba(2,16,25,0.4);
      ">${badgeText}</div>`
    : "";

  return L.divIcon({
    className: "ocean-atlas-dive-pin",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        ${badgeHtml}
        <div style="display:flex;flex-direction:column;align-items:center;position:relative;">
          <div style="
            position:absolute;top:-5px;width:38px;height:38px;border-radius:50%;
            background:rgba(6, 182, 212, 0.25);
          "></div>
          <div style="
            width:28px;height:28px;border-radius:50%;
            background:linear-gradient(135deg, ${DIVE_PIN_CYAN}, ${DIVE_PIN_DEEP});
            border:2px solid #FFFFFF;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 3px 6px rgba(2, 16, 25, 0.4);
            font-size:13px;line-height:1;
          ">🤿</div>
          <div style="
            width:0;height:0;
            border-left:6px solid transparent;
            border-right:6px solid transparent;
            border-top:7px solid ${DIVE_PIN_DEEP};
            margin-top:-2px;
          "></div>
        </div>
      </div>
    `,
    iconSize: [44, totalHeight],
    iconAnchor: [22, totalHeight],
    popupAnchor: [0, -totalHeight],
  });
}

// Leaflet measures its container's pixel size once at init and caches it - it
// has no way to observe a later resize on its own. If this map is mounted
// while its container is collapsed (e.g. inside an accordion animating from
// height 0), or the container is otherwise resized after mount, Leaflet keeps
// rendering against the stale size and the tiles come out blank/misaligned
// until something tells it to remeasure. `invalidateSize()` is that signal.
function InvalidateSizeOnChange({ trigger }: { trigger: unknown }) {
  const map = useMap();

  useEffect(() => {
    const id = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [trigger, map]);

  return null;
}

// Esri's ArcGIS REST tile scheme orders path segments z/row/col (not the usual
// z/x/y), so {y} and {x} are deliberately swapped in these URLs relative to
// the CARTO one above - verified directly against the tile endpoint.
const SATELLITE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SATELLITE_ATTRIBUTION = "Tiles &copy; Esri";
const HYBRID_LABELS_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

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
  showConditions?: boolean;
  /** Bump this (e.g. with a boolean/counter) whenever the map's container might
   * have just changed size after mount - see InvalidateSizeOnChange above.
   * Ignored on native, where the platform map view resizes itself normally. */
  invalidateSizeTrigger?: unknown;
}

export default function DiveMapView({
  adventures,
  onSelectAdventure,
  showConditions = false,
  invalidateSizeTrigger,
}: DiveMapViewProps) {
  const { mapStyle } = usePreferences();

  return (
    <View style={{ flex: 1 }}>
      <MapContainer
        center={WORLD_CENTER}
        zoom={WORLD_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        {mapStyle === "standard" ? (
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors &copy; <a href="https://carto.com">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png"
            subdomains="abcd"
            tileSize={512}
            zoomOffset={-1}
            minZoom={1}
            maxZoom={20}
          />
        ) : (
          <>
            <TileLayer attribution={SATELLITE_ATTRIBUTION} url={SATELLITE_TILE_URL} maxZoom={19} />
            {mapStyle === "hybrid" && (
              <TileLayer url={HYBRID_LABELS_URL} maxZoom={19} />
            )}
          </>
        )}
        <InvalidateSizeOnChange trigger={invalidateSizeTrigger} />
        <FitToMarkers adventures={adventures} />
        {adventures.map((adventure) => (
          <Marker
            key={adventure.id}
            position={[adventure.latitude, adventure.longitude]}
            icon={buildDiveIcon(showConditions ? formatConditionsBadge(adventure) : undefined)}
            eventHandlers={{ click: () => onSelectAdventure(adventure) }}
          />
        ))}
      </MapContainer>
    </View>
  );
}
