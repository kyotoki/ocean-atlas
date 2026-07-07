const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export async function geocodeLocationName(query: string): Promise<GeocodeResult | null> {
  const url = `${NOMINATIM_SEARCH_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "SvelApp/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const results: { lat: string; lon: string }[] = await response.json();
  if (!results || results.length === 0) {
    return null;
  }

  const [top] = results;
  const latitude = Number(top.lat);
  const longitude = Number(top.lon);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return { latitude, longitude };
}
