import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useState } from "react";

import { ENDPOINTS } from "../constants/api";
import {
  getQueue,
  markQueueItemFailed,
  MAX_QUEUE_SIZE,
  QueuedAdventure,
  removeFromQueue,
} from "./adventureQueue";
import { useAuthedFetch } from "./api";
import { isAuthError, REAUTH_MESSAGE, ServerRejectedError } from "./errors";
import { uploadPhoto } from "./uploadPhoto";

type AuthedFetch = ReturnType<typeof useAuthedFetch>;

// Module-level (not per-hook-instance) so that if useAdventureSync is mounted
// from more than one screen at once, a reconnect only drives one sync pass
// at a time instead of every mounted screen racing to sync the same queue.
let isSyncing = false;

type SyncResult =
  | { outcome: "synced" }
  | { outcome: "failed"; error: ServerRejectedError }
  | { outcome: "retry" };

async function syncOne(item: QueuedAdventure, authedFetch: AuthedFetch): Promise<SyncResult> {
  try {
    const photoUrls: string[] = [];
    for (const photo of item.photos) {
      photoUrls.push(await uploadPhoto(authedFetch, ENDPOINTS.uploads, photo));
    }

    const response = await authedFetch(ENDPOINTS.adventures, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item.payload, photos: photoUrls }),
    });

    if (!response.ok) {
      throw new ServerRejectedError(`Server responded with status ${response.status}`, response.status);
    }
    return { outcome: "synced" };
  } catch (err) {
    // A real rejection means retrying unchanged would just fail again -
    // anything else (fetch threw, token refresh failed) is assumed to be a
    // connectivity blip worth retrying on the next reconnect.
    return err instanceof ServerRejectedError ? { outcome: "failed", error: err } : { outcome: "retry" };
  }
}

export interface UseAdventureSync {
  pendingCount: number;
  failedCount: number;
  isQueueFull: boolean;
  needsReauth: boolean;
  isSyncing: boolean;
  runSync: () => Promise<void>;
  refreshCounts: () => Promise<void>;
}

export function useAdventureSync(): UseAdventureSync {
  const authedFetch = useAuthedFetch();
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [isSyncingState, setIsSyncingState] = useState(false);

  const refreshCounts = useCallback(async () => {
    const queue = await getQueue();
    setPendingCount(queue.filter((item) => item.status === "pending").length);
    const failed = queue.filter((item) => item.status === "failed");
    setFailedCount(failed.length);
    setNeedsReauth(failed.some((item) => item.requiresReauth));
  }, []);

  const isQueueFull = pendingCount + failedCount >= MAX_QUEUE_SIZE;

  const runSync = useCallback(async () => {
    if (isSyncing) {
      return;
    }
    isSyncing = true;
    setIsSyncingState(true);
    try {
      const queue = await getQueue();
      for (const item of queue.filter((entry) => entry.status === "pending")) {
        const result = await syncOne(item, authedFetch);
        if (result.outcome === "synced") {
          await removeFromQueue(item.localId);
        } else if (result.outcome === "failed") {
          const reauth = isAuthError(result.error);
          await markQueueItemFailed(item.localId, reauth ? REAUTH_MESSAGE : result.error.message, {
            requiresReauth: reauth,
          });
        }
        // "retry": leave it as-is in the queue for the next sync pass.
      }
    } finally {
      isSyncing = false;
      setIsSyncingState(false);
      await refreshCounts();
    }
  }, [authedFetch, refreshCounts]);

  useEffect(() => {
    refreshCounts();
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        runSync();
      }
    });
    return unsubscribe;
  }, [runSync, refreshCounts]);

  return {
    pendingCount,
    failedCount,
    isQueueFull,
    needsReauth,
    isSyncing: isSyncingState,
    runSync,
    refreshCounts,
  };
}
