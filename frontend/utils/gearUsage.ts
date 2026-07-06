import { Adventure } from "../types/adventure";

export interface GearUsage {
  tripCount: number;
  totalMinutes: number;
}

/**
 * Gear isn't linked to specific dives by any relational field in the backend
 * (adding one would mean a new model + migration + log-form UI just for this).
 * Instead, usage is computed by matching a gear item's name against the free-text
 * `notes` divers already write for each adventure (case-insensitive substring
 * match) - genuinely dynamic, pulled from real logged data, without a schema
 * change. It undercounts (only catches dives where the gear was mentioned by
 * name in notes) rather than fabricating a number.
 */
export function computeGearUsage(gearName: string, adventures: Adventure[]): GearUsage {
  const needle = gearName.trim().toLowerCase();
  if (!needle) {
    return { tripCount: 0, totalMinutes: 0 };
  }

  const matches = adventures.filter((adventure) =>
    adventure.notes?.toLowerCase().includes(needle)
  );

  return {
    tripCount: matches.length,
    totalMinutes: matches.reduce((sum, adventure) => sum + adventure.duration_minutes, 0),
  };
}
