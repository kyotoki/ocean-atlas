import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { View } from "react-native";

import { ACTIVITY_TYPES, getActivityTypeOption } from "../../constants/activityTypes";
import { colors, radius, spacing, typography, withOpacity } from "../../constants/theme";
import { usePreferences } from "../../contexts/PreferencesContext";
import { Adventure, ActivityType } from "../../types/adventure";
import { formatConditionsBadge } from "../../utils/mapConditions";
import MapLegend from "./MapLegend";

const WORLD_CENTER: [number, number] = [10, 0];
const WORLD_ZOOM = 2;

const PIN_HEIGHT = 38;
const BADGE_HEIGHT = 20;

// Built per-marker (rather than a single shared constant) since the badge
// makes each icon's content - and therefore its height/anchor - depend on
// that specific adventure's conditions, and now also on its activity type
// and selected state. The badge sits above the circle so the tail tip (the
// actual anchored point) never moves.
function buildDiveIcon(activityType: ActivityType, badgeText: string | undefined, isSelected: boolean) {
  const { markerEmoji, color } = getActivityTypeOption(activityType);
  const totalHeight = PIN_HEIGHT + (badgeText ? BADGE_HEIGHT : 0);
  const badgeHtml = badgeText
    ? `<div style="
        background:${colors.secondary};color:${colors.text.inverse};font-size:${typography.size.caption}px;font-weight:${typography.weight.bold};
        letter-spacing:0.2px;white-space:nowrap;border-radius:${radius.sm}px;
        border:1px solid ${withOpacity(colors.surface.card, 0.5)};padding:${spacing.xxs}px ${spacing.xs}px;margin-bottom:${spacing.xxs}px;
        box-shadow:0 2px 3px ${colors.overlay.scrimMedium};
      ">${badgeText}</div>`
    : "";

  const glowSize = isSelected ? 46 : 38;
  const glowTop = isSelected ? -7 : -5;
  const circleBorderWidth = isSelected ? 3 : 2;
  // Extra invisible padding around the visible glyph so the clickable area
  // is comfortably bigger than the pin itself, without moving the anchored
  // point (still the tail tip, at the bottom of this whole box).
  const hitPaddingX = 8;
  const hitPaddingTop = 8;

  return L.divIcon({
    className: "svel-dive-pin",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;padding:${hitPaddingTop}px ${hitPaddingX}px 0;box-sizing:border-box;">
        ${badgeHtml}
        <div style="display:flex;flex-direction:column;align-items:center;position:relative;">
          <div style="
            position:absolute;top:${glowTop}px;width:${glowSize}px;height:${glowSize}px;border-radius:50%;
            background:${withOpacity(color, isSelected ? 0.4 : 0.25)};
          "></div>
          <div style="
            width:28px;height:28px;border-radius:50%;
            background:linear-gradient(135deg, ${color}, ${colors.secondary});
            border:${circleBorderWidth}px solid ${colors.surface.card};
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 3px 6px ${colors.overlay.scrimMedium};
            font-size:${typography.size.small}px;line-height:1;
          ">${markerEmoji}</div>
          <div style="
            width:0;height:0;
            border-left:6px solid transparent;
            border-right:6px solid transparent;
            border-top:7px solid ${colors.secondary};
            margin-top:-2px;
          "></div>
        </div>
      </div>
    `,
    iconSize: [44 + hitPaddingX * 2, totalHeight + hitPaddingTop],
    iconAnchor: [22 + hitPaddingX, totalHeight + hitPaddingTop],
    popupAnchor: [0, -(totalHeight + hitPaddingTop)],
  });
}

// Themed to match the app's palette rather than leaflet.markercluster's
// default yellow/orange/red bullseye styling.
function createClusterIcon(cluster: { getChildCount: () => number }) {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${colors.primary};border:2px solid ${colors.surface.card};
      display:flex;align-items:center;justify-content:center;
      color:${colors.text.inverse};font-size:${typography.size.small}px;font-weight:${typography.weight.bold};
      box-shadow:0 3px 6px ${colors.overlay.scrimMedium};
    ">${count}</div>`,
    className: "svel-cluster-icon",
    iconSize: [36, 36],
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
  /** The currently-open adventure's id (the caller already tracks this to
   * drive AdventureDetailModal) - passed back in as a controlled value so
   * the pin's "selected" look clears the moment the caller's modal closes. */
  selectedAdventureId?: number | null;
  /** Bump this (e.g. with a boolean/counter) whenever the map's container might
   * have just changed size after mount - see InvalidateSizeOnChange above.
   * Ignored on native, where the platform map view resizes itself normally. */
  invalidateSizeTrigger?: unknown;
}

export default function DiveMapView({
  adventures,
  onSelectAdventure,
  showConditions = false,
  selectedAdventureId = null,
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
        <MarkerClusterGroup
          iconCreateFunction={createClusterIcon}
          showCoverageOnHover={false}
          maxClusterRadius={50}
        >
          {adventures.map((adventure) => (
            <Marker
              key={adventure.id}
              position={[adventure.latitude, adventure.longitude]}
              icon={buildDiveIcon(
                adventure.activity_type,
                showConditions ? formatConditionsBadge(adventure) : undefined,
                adventure.id === selectedAdventureId
              )}
              eventHandlers={{ click: () => onSelectAdventure(adventure) }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      {adventures.length > 0 && <MapLegend />}
    </View>
  );
}

// Referenced so the shared activity-type list stays the single source of
// truth here too, even though this file mostly consumes it indirectly via
// getActivityTypeOption.
void ACTIVITY_TYPES;
