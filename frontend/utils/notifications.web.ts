import { Adventure } from "../types/adventure";

// Web override for utils/notifications.ts (same platform-split convention as
// components/map/DiveMapView.tsx / DiveMapView.web.tsx) - Metro resolves this
// file instead of the native one when bundling for web, so the web bundle
// never imports expo-notifications at all, let alone calls it. A browser tab
// has no background scheduler to fire a local notification once it's closed,
// so there's no partial/best-effort web behavior worth building here - every
// export below is a genuine no-op, not a caught error.
//
// Same exported signatures as utils/notifications.ts so every call site
// (app/(tabs)/index.tsx, hooks/useAdventureForm.ts) stays platform-agnostic.

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function syncStreakReminder(_adventures: Adventure[]): Promise<void> {}

export async function extendStreakReminderFromLog(_loggedDate: string): Promise<void> {}

export async function cancelStreakReminder(): Promise<void> {}
