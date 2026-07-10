import { Adventure } from "../types/adventure";

const DAY_MS = 86_400_000;

// Adventure.date is a local "YYYY-MM-DD" string (see utils/date.ts's
// formatDateISO). Parsing it with `new Date(dateStr)` treats it as UTC
// midnight, which can land on the wrong local calendar day depending on the
// device's timezone offset. Converting to a UTC-based day index instead
// keeps every date's *relative* spacing correct without ever needing to
// reason about local time - we only ever compare day differences, never an
// actual instant.
function dateStringToDayIndex(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

// The longest run of consecutive calendar days that ever contained at least
// one logged adventure (any activity type - a streak is about consistently
// opening the app, not about sticking to one activity). Deliberately the
// *longest ever* streak, not the current one: every other achievement in
// this file is a permanent, monotonic unlock once a threshold is crossed,
// and a streak achievement that could re-lock after a missed day would break
// that pattern and feel punishing rather than motivating.
export function computeLongestStreakDays(adventures: Adventure[]): number {
  const dayIndices = Array.from(new Set(adventures.map((a) => dateStringToDayIndex(a.date)))).sort(
    (a, b) => a - b
  );

  let longest = 0;
  let current = 0;
  let previous: number | null = null;
  for (const day of dayIndices) {
    current = previous !== null && day === previous + 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = day;
  }
  return longest;
}

// The most recent logged adventure's date string ("YYYY-MM-DD") - lexical
// comparison is safe and sufficient since that format sorts chronologically
// without needing to parse it into a Date first.
export function getMostRecentAdventureDate(adventures: Adventure[]): string | null {
  if (adventures.length === 0) {
    return null;
  }
  return adventures.reduce((latest, a) => (a.date > latest ? a.date : latest), adventures[0].date);
}

// Whole calendar days between the most recent logged adventure and `now` -
// the actual signal a "haven't logged in a while" reminder should key off,
// as distinct from the longest-streak-ever achievement above. Returns null
// when there's no adventure to measure from (a brand new account shouldn't
// be told it's "overdue").
export function computeDaysSinceLastLog(adventures: Adventure[], now: Date = new Date()): number | null {
  if (adventures.length === 0) {
    return null;
  }
  const mostRecentDay = Math.max(...adventures.map((a) => dateStringToDayIndex(a.date)));
  const todayIndex = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY_MS);
  return Math.max(0, todayIndex - mostRecentDay);
}
