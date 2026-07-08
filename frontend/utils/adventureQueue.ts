import AsyncStorage from "@react-native-async-storage/async-storage";

import { ActivityType } from "../types/adventure";

// The exact POST /adventures/ body shape, minus `photos` - queued photos are
// tracked separately (see QueuedPhoto) since they need to be uploaded first
// to get real URLs, which can only happen once connectivity is back.
export interface QueuedAdventurePayload {
  title: string;
  date: string;
  location_name: string;
  latitude: number;
  longitude: number;
  max_depth_meters: number;
  duration_minutes: number;
  notes: string | null;
  activity_type: ActivityType;
  tank_pressure_bar: number | null;
  gas_mix: string | null;
}

// A structural subset of ImagePicker.ImagePickerAsset that survives
// JSON.stringify - just enough for uploadPhoto() to re-upload it later.
export interface QueuedPhoto {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
}

export type QueuedAdventureStatus = "pending" | "failed";

export interface QueuedAdventure {
  localId: string;
  payload: QueuedAdventurePayload;
  photos: QueuedPhoto[];
  status: QueuedAdventureStatus;
  error?: string;
  queuedAt: string;
}

const STORAGE_KEY = "svel_adventure_sync_queue";

async function readQueue(): Promise<QueuedAdventure[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as QueuedAdventure[];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedAdventure[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<QueuedAdventure[]> {
  return readQueue();
}

export async function enqueueAdventure(
  payload: QueuedAdventurePayload,
  photos: QueuedPhoto[]
): Promise<QueuedAdventure> {
  const queue = await readQueue();
  const item: QueuedAdventure = {
    // Timestamp + random suffix rather than a counter - two dives queued in
    // the same millisecond (offline, by hand) is implausible, but this
    // avoids needing a separately-persisted counter to stay collision-free
    // across app restarts.
    localId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    payload,
    photos,
    status: "pending",
    queuedAt: new Date().toISOString(),
  };
  await writeQueue([...queue, item]);
  return item;
}

export async function removeFromQueue(localId: string): Promise<void> {
  const queue = await readQueue();
  await writeQueue(queue.filter((item) => item.localId !== localId));
}

// A "failed" item reached the server and was rejected (validation, auth,
// etc.) - retrying it unchanged would just fail the same way again, so it's
// set aside instead of being retried on every reconnect.
export async function markQueueItemFailed(localId: string, error: string): Promise<void> {
  const queue = await readQueue();
  await writeQueue(
    queue.map((item) => (item.localId === localId ? { ...item, status: "failed", error } : item))
  );
}

export async function discardQueueItem(localId: string): Promise<void> {
  await removeFromQueue(localId);
}
