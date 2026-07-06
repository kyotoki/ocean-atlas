import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// expo-secure-store's web implementation is a no-op stub (it has no Keychain/
// Keystore equivalent in a browser), so it silently fails to persist anything
// on web. Since this app is used on web, fall back to localStorage there.
async function readRaw(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await readRaw(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  await writeRaw(key, JSON.stringify(value));
}
