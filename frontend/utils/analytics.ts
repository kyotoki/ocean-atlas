import { readJSON, writeJSON } from "./deviceStorage";

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface AnalyticsClient {
  track(event: string, properties?: AnalyticsProperties): void;
}

// Every call site below imports `track`/`AnalyticsEvents` from this file,
// never a specific provider - logs to the console in dev and does nothing in
// production. There's no live PostHog project to send these to yet (that's
// planned for Month 4); this stub exists so events get instrumented at their
// real call sites now instead of being bolted on later.
const consoleClient: AnalyticsClient = {
  track(event, properties) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[analytics] ${event}`, properties ?? {});
    }
  },
};

// The one line that changes in Month 4: swap this assignment for a real
// PostHog-backed client that satisfies the same AnalyticsClient interface
// (a `track(event, properties)` method) - no call site below needs to change.
const client: AnalyticsClient = consoleClient;

export const AnalyticsEvents = {
  AppOpened: "app_opened",
  AdventureLogged: "adventure_logged",
  FirstAdventureLogged: "first_adventure_logged",
  FirstPhotoAdded: "first_photo_added",
} as const;

export function track(event: string, properties?: AnalyticsProperties): void {
  client.track(event, properties);
}

function milestoneStorageKey(userId: string, milestone: string): string {
  return `svel_analytics_milestone_${userId}_${milestone}`;
}

// Returns true only the very first time this is called for a given
// (userId, milestone) pair, false on every call after - lets a call site
// fire a "first_x" activation event exactly once per user without needing a
// server round-trip to check the user's history first.
export async function isFirstOccurrence(userId: string, milestone: string): Promise<boolean> {
  const key = milestoneStorageKey(userId, milestone);
  const alreadyOccurred = await readJSON<boolean>(key, false);
  if (alreadyOccurred) {
    return false;
  }
  await writeJSON(key, true);
  return true;
}
