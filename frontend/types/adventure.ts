export interface Adventure {
  id: number;
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  max_depth_meters: number;
  duration_minutes: number;
  notes: string | null;
  photo_url: string | null;
}

export type AdventureInput = Omit<Adventure, "id">;
