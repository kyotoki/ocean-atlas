import type { ImagePickerAsset } from "expo-image-picker";
import { Platform } from "react-native";

type AuthedFetch = (input: string, init?: RequestInit) => Promise<Response>;

export async function uploadPhoto(
  authedFetch: AuthedFetch,
  endpoint: string,
  asset: ImagePickerAsset
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
    throw new Error(`Photo upload failed with status ${response.status}`);
  }

  const data: { url: string } = await response.json();
  return data.url;
}
