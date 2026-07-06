import { readJSON, writeJSON } from "./deviceStorage";

export interface GearItem {
  id: string;
  name: string;
  type: string;
}

export interface LocalProfileFields {
  bio: string;
  homeCountryCode: string | null;
  certifications: string[];
  gear: GearItem[];
}

export const DEFAULT_LOCAL_PROFILE: LocalProfileFields = {
  bio: "",
  homeCountryCode: null,
  certifications: [],
  gear: [],
};

// Bio / home country / certifications / gear aren't part of the backend
// adventure log (there's no user-profile table - user identity comes entirely
// from Clerk), so they're kept as on-device preferences rather than a new
// backend surface. Keyed per Clerk user id so switching accounts on the same
// device doesn't leak one user's profile into another's.
function storageKey(userId: string): string {
  return `ocean_atlas_profile_${userId}`;
}

export async function loadLocalProfile(userId: string): Promise<LocalProfileFields> {
  const stored = await readJSON<Partial<LocalProfileFields>>(storageKey(userId), {});
  return { ...DEFAULT_LOCAL_PROFILE, ...stored };
}

export async function saveLocalProfile(
  userId: string,
  fields: LocalProfileFields
): Promise<void> {
  await writeJSON(storageKey(userId), fields);
}
