import { Adventure } from "../types/adventure";
import { GearItem } from "./profileStorage";

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  color: string;
  unlocked: boolean;
  description: string;
}

export interface AchievementGroups {
  scuba: Achievement[];
  snorkel: Achievement[];
  certification: Achievement[];
  global: Achievement[];
}

const SCUBA_COLOR = "#0B3D91";
const SNORKEL_COLOR = "#06B6D4";
const CERT_COLOR = "#B8860B";
const GLOBETROTTER_COLOR = "#1B8A5A";
const NIGHT_OWL_COLOR = "#5B3E96";
const GEAR_GURU_COLOR = "#B0472B";

function scubaEmoji(threshold: number): string {
  switch (threshold) {
    case 1:
      return "🤿";
    case 5:
      return "🌊";
    case 10:
      return "🔟";
    case 15:
      return "🏅";
    case 20:
      return "⭐";
    case 50:
      return "👑";
    case 100:
      return "🔱";
    default:
      return "🏆";
  }
}

// Fixed named tiers, then an escalator that keeps generating the next
// hundred-dive tier as the user's count approaches/passes it - the series
// never "runs out" no matter how many dives get logged.
function scubaMilestoneTiers(scubaCount: number): { threshold: number; name: string }[] {
  const tiers = [
    { threshold: 1, name: "First Descent" },
    { threshold: 5, name: "Deep Five" },
    { threshold: 10, name: "Double Digits" },
    { threshold: 15, name: "The Aqua 15" },
    { threshold: 20, name: "Vanguard 20" },
    { threshold: 50, name: "Half Century" },
    { threshold: 100, name: "Century Diver" },
  ];

  const nextUnearnedHundred = Math.max(200, Math.ceil((scubaCount + 1) / 100) * 100);
  for (let threshold = 200; threshold <= nextUnearnedHundred; threshold += 100) {
    tiers.push({ threshold, name: `${threshold} Dive Legend` });
  }
  return tiers;
}

const SNORKEL_TIERS: { threshold: number; name: string; emoji: string }[] = [
  { threshold: 1, name: "Reef Explorer", emoji: "🐠" },
  { threshold: 5, name: "Fin Fanatic", emoji: "🩱" },
  { threshold: 10, name: "Tidal Wave", emoji: "🌊" },
  { threshold: 15, name: "Mermaid Status", emoji: "🧜‍♀️" },
];

const ELITE_CERTIFICATIONS = ["Rescue Diver", "Divemaster"];

// Adventures don't capture a dive start time (the date picker is date-only),
// so "night" is read from created_at - when the entry was logged - as the
// closest available real signal, the same way stats.py's "countries_visited"
// is documented as a distinct-location-name proxy rather than a true
// geocoded country.
function isLoggedAtNight(adventure: Adventure): boolean {
  const hour = new Date(adventure.created_at).getHours();
  return hour >= 18 || hour < 6;
}

function pluralize(count: number, singular: string, plural: string = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

export function buildAchievements(
  adventures: Adventure[],
  gear: GearItem[],
  certifications: string[]
): AchievementGroups {
  const scubaCount = adventures.filter((a) => a.activity_type === "scuba").length;
  const snorkelCount = adventures.filter((a) => a.activity_type === "snorkeling").length;

  const scuba: Achievement[] = scubaMilestoneTiers(scubaCount).map(({ threshold, name }) => {
    const unlocked = scubaCount >= threshold;
    const remaining = threshold - scubaCount;
    return {
      id: `scuba-${threshold}`,
      name,
      emoji: scubaEmoji(threshold),
      color: SCUBA_COLOR,
      unlocked,
      description: unlocked
        ? `Unlocked! You've logged ${scubaCount} scuba ${pluralize(scubaCount, "dive")}.`
        : `Locked: Log ${remaining} more scuba ${pluralize(remaining, "dive")} to unlock ${name}!`,
    };
  });

  const snorkel: Achievement[] = SNORKEL_TIERS.map(({ threshold, name, emoji }) => {
    const unlocked = snorkelCount >= threshold;
    const remaining = threshold - snorkelCount;
    return {
      id: `snorkel-${threshold}`,
      name,
      emoji,
      color: SNORKEL_COLOR,
      unlocked,
      description: unlocked
        ? `Unlocked! You've logged ${snorkelCount} snorkeling ${pluralize(snorkelCount, "adventure")}.`
        : `Locked: Log ${remaining} more snorkeling ${pluralize(remaining, "adventure")} to unlock ${name}!`,
    };
  });

  const hasCertification = certifications.length > 0;
  const hasEliteCertification = certifications.some((c) => ELITE_CERTIFICATIONS.includes(c));
  const certification: Achievement[] = [
    {
      id: "cert-explorer",
      name: "Certified Explorer",
      emoji: "🎓",
      color: CERT_COLOR,
      unlocked: hasCertification,
      description: hasCertification
        ? "Unlocked! You've logged a real-world diving certification."
        : "Locked: Check off any certification in My Certifications & Licenses to unlock Certified Explorer!",
    },
    {
      id: "cert-elite",
      name: "Elite Guardian",
      emoji: "🛡️",
      color: CERT_COLOR,
      unlocked: hasEliteCertification,
      description: hasEliteCertification
        ? "Unlocked! Rescue Diver (or higher) confirmed."
        : "Locked: Add Rescue Diver or Divemaster in My Certifications & Licenses to unlock Elite Guardian!",
    },
  ];

  // No geocoded country is stored on an adventure (only a free-text
  // location_name) - distinct location names is the same practical proxy
  // the backend's DiveStats.countries_visited already uses.
  const distinctLocations = new Set(
    adventures.map((a) => a.location_name.trim().toLowerCase()).filter(Boolean)
  ).size;
  const hasGlobetrotter = distinctLocations >= 2;
  const locationsRemaining = Math.max(2 - distinctLocations, 0);

  const hasNightOwl = adventures.some(isLoggedAtNight);

  const hasGearGuru = gear.length >= 3;
  const gearRemaining = Math.max(3 - gear.length, 0);

  const global: Achievement[] = [
    {
      id: "global-trotter",
      name: "Globetrotter",
      emoji: "🌍",
      color: GLOBETROTTER_COLOR,
      unlocked: hasGlobetrotter,
      description: hasGlobetrotter
        ? "Unlocked! You've logged adventures across multiple locations."
        : `Locked: Log adventures in ${locationsRemaining} more distinct ${pluralize(locationsRemaining, "location")} to unlock Globetrotter!`,
    },
    {
      id: "global-nightowl",
      name: "Night Owl",
      emoji: "🌙",
      color: NIGHT_OWL_COLOR,
      unlocked: hasNightOwl,
      description: hasNightOwl
        ? "Unlocked! You've logged an adventure between 6 PM and 6 AM."
        : "Locked: Log an adventure between 6 PM and 6 AM to unlock Night Owl!",
    },
    {
      id: "global-gearguru",
      name: "Gear Guru",
      emoji: "🔧",
      color: GEAR_GURU_COLOR,
      unlocked: hasGearGuru,
      description: hasGearGuru
        ? "Unlocked! You're tracking 3+ pieces of gear in the Gear Manager."
        : `Locked: Add ${gearRemaining} more gear ${pluralize(gearRemaining, "item")} in the Gear Manager to unlock Gear Guru!`,
    },
  ];

  return { scuba, snorkel, certification, global };
}
