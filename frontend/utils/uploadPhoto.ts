import { Platform } from "react-native";

import { ServerRejectedError } from "./errors";

type AuthedFetch = (input: string, init?: RequestInit) => Promise<Response>;

// A structural subset of ImagePicker.ImagePickerAsset - loose enough that a
// plain persisted record (read back out of the offline sync queue, which can
// only hold JSON-serializable fields) satisfies it too, so the sync engine
// can reuse this same function instead of a second near-duplicate.
export interface UploadablePhoto {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  file?: File;
}

export async function uploadPhoto(
  authedFetch: AuthedFetch,
  endpoint: string,
  asset: UploadablePhoto
): Promise<string> {
  const formData = new FormData();
  const filename = asset.fileName ?? "photo.jpg";

  if (Platform.OS === "web") {
    const webFile = asset.file ?? (await (await fetch(asset.uri)).blob());
    formData.append("file", webFile, filename);
  } else {
    formData.append("file", {
      uri: asset.uri,
      name: filename,
      type: asset.mimeType ?? "image/jpeg",
    } as unknown as Blob);
  }

  const response = await authedFetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new ServerRejectedError(`Photo upload failed with status ${response.status}`);
  }

  const data: { url: string } = await response.json();
  return data.url;
}
