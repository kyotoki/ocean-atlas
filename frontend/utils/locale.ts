import * as Localization from "expo-localization";

const FALLBACK_LANGUAGE_CODE = "en";

/**
 * The device's active system language (e.g. "en", "ja", "pt"), for anything in
 * the map stack that can actually honor it (currently: nothing in
 * react-native-maps or our Leaflet/OSM web tiles - both Apple MapKit and the
 * Google Maps SDK already read the OS locale directly and have no per-instance
 * language override, and OSM's free raster tiles bake label language into the
 * image server-side). Kept as a small, single source of truth so any future
 * locale-aware tile provider or map config has one place to read from.
 */
export function getDeviceLanguageCode(): string {
  return Localization.getLocales()[0]?.languageCode ?? FALLBACK_LANGUAGE_CODE;
}
