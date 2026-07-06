import { Adventure } from "../types/adventure";

/**
 * Compact label for a dive pin's ocean-conditions badge. Prefers water
 * temperature (the more universally meaningful figure for divers); falls back
 * to wave height when temperature wasn't captured (older dives, or the marine
 * weather lookup failed at save time - see marine_weather.py). Returns
 * undefined when neither is available, so callers can render the plain pin.
 */
export function formatConditionsBadge(adventure: Adventure): string | undefined {
  if (adventure.water_temp_c != null) {
    return `${Math.round(adventure.water_temp_c)}°C`;
  }
  if (adventure.wave_height_m != null) {
    return `${adventure.wave_height_m.toFixed(1)}m`;
  }
  return undefined;
}
