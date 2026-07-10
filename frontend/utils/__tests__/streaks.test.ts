import { Adventure } from "../../types/adventure";
import { computeDaysSinceLastLog, computeLongestStreakDays, getMostRecentAdventureDate } from "../streaks";

function makeAdventure(id: number, date: string): Adventure {
  return {
    id,
    title: "Dive",
    date,
    created_at: `${date}T12:00:00.000Z`,
    location_name: "Test Site",
    latitude: 1,
    longitude: 2,
    max_depth_meters: 10,
    duration_minutes: 30,
    notes: null,
    photos: [],
    water_temp_c: null,
    wave_height_m: null,
    tide_height_m: null,
    activity_type: "scuba",
    tank_pressure_bar: null,
    gas_mix: null,
  };
}

describe("computeLongestStreakDays", () => {
  test("returns 0 for no adventures", () => {
    expect(computeLongestStreakDays([])).toBe(0);
  });

  test("returns 1 for a single logged day", () => {
    expect(computeLongestStreakDays([makeAdventure(1, "2026-07-01")])).toBe(1);
  });

  test("counts consecutive calendar days as one streak", () => {
    const adventures = [
      makeAdventure(1, "2026-07-01"),
      makeAdventure(2, "2026-07-02"),
      makeAdventure(3, "2026-07-03"),
    ];
    expect(computeLongestStreakDays(adventures)).toBe(3);
  });

  test("a gap of more than one day breaks the streak", () => {
    const adventures = [
      makeAdventure(1, "2026-07-01"),
      makeAdventure(2, "2026-07-02"),
      makeAdventure(3, "2026-07-10"),
    ];
    expect(computeLongestStreakDays(adventures)).toBe(2);
  });

  test("returns the longest streak even if it isn't the most recent one", () => {
    const adventures = [
      makeAdventure(1, "2026-06-01"),
      makeAdventure(2, "2026-06-02"),
      makeAdventure(3, "2026-06-03"),
      makeAdventure(4, "2026-06-04"),
      makeAdventure(5, "2026-07-01"),
    ];
    expect(computeLongestStreakDays(adventures)).toBe(4);
  });

  test("multiple adventures on the same day count once toward the streak", () => {
    const adventures = [
      makeAdventure(1, "2026-07-01"),
      makeAdventure(2, "2026-07-01"),
      makeAdventure(3, "2026-07-02"),
    ];
    expect(computeLongestStreakDays(adventures)).toBe(2);
  });
});

describe("getMostRecentAdventureDate", () => {
  test("returns null for no adventures", () => {
    expect(getMostRecentAdventureDate([])).toBeNull();
  });

  test("returns the latest date regardless of array order", () => {
    const adventures = [
      makeAdventure(1, "2026-07-01"),
      makeAdventure(2, "2026-06-15"),
      makeAdventure(3, "2026-06-20"),
    ];
    expect(getMostRecentAdventureDate(adventures)).toBe("2026-07-01");
  });
});

describe("computeDaysSinceLastLog", () => {
  // Built from local Y/M/D args (not an ISO string, which parses as UTC and
  // can land on a different local calendar day depending on the test
  // runner's timezone) - matching how computeDaysSinceLastLog itself reads
  // `now` via local getters.
  const JULY_15_2026 = new Date(2026, 6, 15);

  test("returns null for no adventures", () => {
    expect(computeDaysSinceLastLog([], JULY_15_2026)).toBeNull();
  });

  test("returns 0 when the most recent adventure was logged today", () => {
    const adventures = [makeAdventure(1, "2026-07-15")];
    expect(computeDaysSinceLastLog(adventures, new Date(2026, 6, 15, 18))).toBe(0);
  });

  test("returns the whole-day gap since the most recent adventure", () => {
    const adventures = [makeAdventure(1, "2026-07-01")];
    expect(computeDaysSinceLastLog(adventures, JULY_15_2026)).toBe(14);
  });
});
