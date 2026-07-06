export interface Country {
  name: string;
  code: string;
}

/** ISO 3166-1 alpha-2 code -> flag emoji, via the regional-indicator-symbol trick
 * (each letter A-Z maps to U+1F1E6-U+1F1FF by offsetting its char code). Works
 * for any valid 2-letter code, no data file needed. */
export function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
}

// A curated list (not the full ISO-3166 set) covering common home countries and
// popular dive/snorkel destinations - enough for a personal profile picker
// without shipping a full country database.
export const COUNTRIES: Country[] = [
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" },
  { name: "New Zealand", code: "NZ" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Spain", code: "ES" },
  { name: "Italy", code: "IT" },
  { name: "Portugal", code: "PT" },
  { name: "Netherlands", code: "NL" },
  { name: "Belgium", code: "BE" },
  { name: "Switzerland", code: "CH" },
  { name: "Austria", code: "AT" },
  { name: "Sweden", code: "SE" },
  { name: "Norway", code: "NO" },
  { name: "Denmark", code: "DK" },
  { name: "Ireland", code: "IE" },
  { name: "Poland", code: "PL" },
  { name: "Greece", code: "GR" },
  { name: "Turkey", code: "TR" },
  { name: "Israel", code: "IL" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "Egypt", code: "EG" },
  { name: "South Africa", code: "ZA" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "China", code: "CN" },
  { name: "India", code: "IN" },
  { name: "Singapore", code: "SG" },
  { name: "Malaysia", code: "MY" },
  { name: "Thailand", code: "TH" },
  { name: "Indonesia", code: "ID" },
  { name: "Philippines", code: "PH" },
  { name: "Vietnam", code: "VN" },
  { name: "Fiji", code: "FJ" },
  { name: "Maldives", code: "MV" },
  { name: "Palau", code: "PW" },
  { name: "Brazil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "Argentina", code: "AR" },
  { name: "Chile", code: "CL" },
  { name: "Costa Rica", code: "CR" },
  { name: "Belize", code: "BZ" },
  { name: "Bahamas", code: "BS" },
];
