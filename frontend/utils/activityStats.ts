import { ActivityStats, Adventure } from "../types/adventure";

// Same shape as the backend's per-activity ActivityStats, minus
// `activity_type` - this is computed client-side from whatever adventures
// are already loaded (no matching "combined" endpoint exists, and none is
// needed just to add across activity types the frontend already has).
export type CombinedActivityStats = Omit<ActivityStats, "activity_type">;

export function buildCombinedActivityStats(adventures: Adventure[]): CombinedActivityStats {
  const totalTrips = adventures.length;
  const totalMinutes = adventures.reduce((sum, a) => sum + a.duration_minutes, 0);

  const deepestMeters = adventures.reduce<number | null>((deepest, a) => {
    if (a.max_depth_meters == null) {
      return deepest;
    }
    return deepest == null ? a.max_depth_meters : Math.max(deepest, a.max_depth_meters);
  }, null);

  const averageBottomTimeMinutes = totalTrips > 0 ? totalMinutes / totalTrips : null;

  // Same tie-break as the backend's favorite_site queries: most frequently
  // logged location name, ties broken alphabetically.
  const siteCounts = new Map<string, number>();
  for (const adventure of adventures) {
    const site = adventure.location_name;
    siteCounts.set(site, (siteCounts.get(site) ?? 0) + 1);
  }
  let favoriteSite: string | null = null;
  let favoriteCount = 0;
  for (const [site, count] of siteCounts) {
    if (count > favoriteCount || (count === favoriteCount && (favoriteSite === null || site < favoriteSite))) {
      favoriteSite = site;
      favoriteCount = count;
    }
  }

  return {
    total_trips: totalTrips,
    total_minutes: totalMinutes,
    deepest_meters: deepestMeters,
    average_bottom_time_minutes: averageBottomTimeMinutes,
    favorite_site: favoriteSite,
  };
}
