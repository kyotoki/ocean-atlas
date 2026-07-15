import PostHog from "posthog-react-native";

import { readJSON, writeJSON } from "./deviceStorage";

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface AnalyticsClient {
  track(event: string, properties?: AnalyticsProperties): void;
}

// Every call site below imports `track`/`AnalyticsEvents` from this file,
// never a specific provider - logs to the console in dev, and additionally
// sends to PostHog whenever EXPO_PUBLIC_POSTHOG_KEY is set (unset locally on
// purpose, same as EXPO_PUBLIC_SENTRY_DSN - real values come from eas.json
// build profiles, not local .env).
const consoleClient: AnalyticsClient = {
  track(event, properties) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[analytics] ${event}`, properties ?? {});
    }
  },
};

const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;

// One PostHog project total (not one per backend environment) - events are
// tagged with `environment` below so staging/production stay distinguishable
// within that single project, the same split Sentry uses.
const posthog: PostHog | null = posthogApiKey
  ? new PostHog(posthogApiKey, {
      host: "https://us.i.posthog.com",
    })
  : null;

const environment = process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ?? "development";

const client: AnalyticsClient = {
  track(event, properties) {
    consoleClient.track(event, properties);
    posthog?.capture(event, { ...properties, environment });
  },
};

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
