import NetInfo from "@react-native-community/netinfo";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";

import { ENDPOINTS } from "../constants/api";
import { usePreferences } from "../contexts/PreferencesContext";
import { ActivityType } from "../types/adventure";
import { enqueueAdventure, QueuedAdventurePayload, QueuedPhoto } from "../utils/adventureQueue";
import { useAdventureSync } from "../utils/useAdventureSync";
import { useAuthedFetch } from "../utils/api";
import { showAlert } from "../utils/crossPlatformAlert";
import { formatDateISO } from "../utils/date";
import { ServerRejectedError } from "../utils/errors";
import { geocodeLocationName } from "../utils/geocode";
import { uploadPhoto } from "../utils/uploadPhoto";
import { depthUnitLabel, feetToMeters } from "../utils/units";

export type SubmitStage = "idle" | "uploading-photo" | "saving";
export type LocationInputMode = "coordinates" | "search";
export type GeocodeStatus = "idle" | "loading" | "success" | "error";

export interface AdventureFormState {
  title: string;
  location_name: string;
  latitude: string;
  longitude: string;
  max_depth_meters: string;
  duration_minutes: string;
  notes: string;
  tank_pressure_bar: string;
  gas_mix: string;
}

const INITIAL_FORM: AdventureFormState = {
  title: "",
  location_name: "",
  latitude: "",
  longitude: "",
  max_depth_meters: "",
  duration_minutes: "",
  notes: "",
  tank_pressure_bar: "",
  gas_mix: "",
};

function buildPayload(
  form: AdventureFormState,
  activityType: ActivityType,
  adventureDate: Date,
  isScuba: boolean,
  isImperial: boolean
): QueuedAdventurePayload {
  return {
    title: form.title.trim(),
    date: formatDateISO(adventureDate),
    location_name: form.location_name.trim(),
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    max_depth_meters: isScuba
      ? isImperial
        ? feetToMeters(Number(form.max_depth_meters))
        : Number(form.max_depth_meters)
      : 0,
    duration_minutes: Number(form.duration_minutes),
    notes: form.notes.trim() ? form.notes.trim() : null,
    activity_type: activityType,
    tank_pressure_bar: isScuba && form.tank_pressure_bar.trim() ? Number(form.tank_pressure_bar) : null,
    gas_mix: isScuba && form.gas_mix.trim() ? form.gas_mix.trim() : null,
  };
}

export function useAdventureForm() {
  const router = useRouter();
  const authedFetch = useAuthedFetch();
  const { unitSystem } = usePreferences();
  const { refreshCounts: refreshSyncCounts } = useAdventureSync();
  const isImperial = unitSystem === "imperial";

  const [activityType, setActivityType] = useState<ActivityType>("scuba");
  const [adventureDate, setAdventureDate] = useState<Date>(new Date());
  const [form, setForm] = useState<AdventureFormState>(INITIAL_FORM);
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof AdventureFormState, string>>>({});
  const [submitStage, setSubmitStage] = useState<SubmitStage>("idle");
  const [locationMode, setLocationMode] = useState<LocationInputMode>("coordinates");
  const [locationQuery, setLocationQuery] = useState("");
  const [geocodeStatus, setGeocodeStatus] = useState<GeocodeStatus>("idle");
  const [locationQueryError, setLocationQueryError] = useState<string | undefined>();

  const isSubmitting = submitStage !== "idle";
  const isScuba = activityType === "scuba";
  const isGeocoding = geocodeStatus === "loading";

  const handleActivityTypeChange = (next: ActivityType) => {
    setActivityType(next);
  };

  const updateField = (field: keyof AdventureFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onToggleLocationMode = () => {
    setLocationMode((prev) => (prev === "coordinates" ? "search" : "coordinates"));
    setGeocodeStatus("idle");
    setLocationQueryError(undefined);
  };

  const onLocationQueryChange = (value: string) => {
    setLocationQuery(value);
    if (geocodeStatus !== "idle") {
      setGeocodeStatus("idle");
    }
    if (locationQueryError) {
      setLocationQueryError(undefined);
    }
  };

  const onVerifyLocation = async () => {
    const query = locationQuery.trim();
    if (!query) {
      setGeocodeStatus("error");
      setLocationQueryError("Enter a location name to search.");
      return;
    }

    setGeocodeStatus("loading");
    setLocationQueryError(undefined);
    try {
      const result = await geocodeLocationName(query);
      if (!result) {
        setGeocodeStatus("error");
        setLocationQueryError("Location not found. Please check your spelling or enter raw coordinates.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        latitude: result.latitude.toFixed(6),
        longitude: result.longitude.toFixed(6),
      }));
      setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
      setGeocodeStatus("success");
    } catch {
      setGeocodeStatus("error");
      setLocationQueryError("Location not found. Please check your spelling or enter raw coordinates.");
    }
  };

  const onTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert("Camera access needed", "Enable camera access in Settings to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0]]);
    }
  };

  const onChoosePhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert("Photo library access needed", "Enable photo library access in Settings to choose photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotos((prev) => [...prev, ...result.assets]);
    }
  };

  const removePhotoAt = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof AdventureFormState, string>> = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }
    if (!form.location_name.trim()) {
      nextErrors.location_name = "Location name is required.";
    }

    let nextLocationQueryError: string | undefined;
    if (locationMode === "search") {
      if (geocodeStatus !== "success" || !form.latitude.trim() || !form.longitude.trim()) {
        nextLocationQueryError = "Verify a location before submitting, or switch to entering coordinates.";
      }
    } else {
      const latitude = Number(form.latitude);
      if (form.latitude.trim() === "" || Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
        nextErrors.latitude = "Enter a valid latitude between -90 and 90.";
      }

      const longitude = Number(form.longitude);
      if (
        form.longitude.trim() === "" ||
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        nextErrors.longitude = "Enter a valid longitude between -180 and 180.";
      }
    }
    setLocationQueryError(nextLocationQueryError);

    if (isScuba) {
      const maxDepth = Number(form.max_depth_meters);
      if (form.max_depth_meters.trim() === "" || Number.isNaN(maxDepth) || maxDepth < 0) {
        nextErrors.max_depth_meters = `Enter a valid depth in ${depthUnitLabel(unitSystem)}.`;
      }
    }

    const duration = Number(form.duration_minutes);
    if (
      form.duration_minutes.trim() === "" ||
      Number.isNaN(duration) ||
      duration < 0 ||
      !Number.isInteger(duration)
    ) {
      nextErrors.duration_minutes = "Enter a whole number of minutes.";
    }

    if (isScuba && form.tank_pressure_bar.trim() !== "") {
      const tankPressure = Number(form.tank_pressure_bar);
      if (Number.isNaN(tankPressure) || tankPressure < 0) {
        nextErrors.tank_pressure_bar = "Enter a valid tank pressure.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && !nextLocationQueryError;
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setPhotos([]);
    setActivityType("scuba");
    setAdventureDate(new Date());
    setLocationMode("coordinates");
    setLocationQuery("");
    setGeocodeStatus("idle");
    setLocationQueryError(undefined);
  };

  const queueOffline = async (payload: QueuedAdventurePayload) => {
    const queuedPhotos: QueuedPhoto[] = photos.map((asset) => ({
      uri: asset.uri,
      fileName: asset.fileName ?? null,
      mimeType: asset.mimeType ?? null,
    }));
    await enqueueAdventure(payload, queuedPhotos);
    await refreshSyncCounts();
    resetForm();
    showAlert(
      "Saved offline",
      "You're offline - this adventure has been saved on your device and will sync automatically once you're back online.",
      [
        { text: "View Map", onPress: () => router.push("/") },
        { text: "Log Another", style: "cancel" },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const payload = buildPayload(form, activityType, adventureDate, isScuba, isImperial);

    const netState = await NetInfo.fetch();
    if (netState.isConnected === false) {
      await queueOffline(payload);
      return;
    }

    try {
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        setSubmitStage("uploading-photo");
        try {
          photoUrls = await Promise.all(
            photos.map((asset) => uploadPhoto(authedFetch, ENDPOINTS.uploads, asset))
          );
        } catch (err) {
          if (err instanceof ServerRejectedError) {
            throw new ServerRejectedError("Unable to upload photos. Check your connection and try again.");
          }
          throw err;
        }
      }

      setSubmitStage("saving");
      const response = await authedFetch(ENDPOINTS.adventures, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, photos: photoUrls }),
      });

      if (!response.ok) {
        throw new ServerRejectedError(`Server responded with status ${response.status}`);
      }

      resetForm();
      showAlert("Adventure logged", "Your dive has been added to the Ocean Map.", [
        { text: "View Map", onPress: () => router.push("/") },
        { text: "Log Another", style: "cancel" },
      ]);
    } catch (err) {
      if (err instanceof ServerRejectedError) {
        showAlert("Unable to save adventure", err.message);
      } else {
        // Not a server rejection - fetch itself failed (or the auth token
        // refresh did), which almost always means we lost connectivity
        // between the upfront check and now. Don't leave the user with a
        // dead-end error for something they didn't do wrong.
        await queueOffline(payload);
      }
    } finally {
      setSubmitStage("idle");
    }
  };

  return {
    activityType,
    adventureDate,
    form,
    photos,
    errors,
    submitStage,
    isSubmitting,
    isScuba,
    isImperial,
    locationMode,
    locationQuery,
    geocodeStatus,
    isGeocoding,
    locationQueryError,
    setAdventureDate,
    handleActivityTypeChange,
    updateField,
    onToggleLocationMode,
    onLocationQueryChange,
    onVerifyLocation,
    onTakePhoto,
    onChoosePhotos,
    removePhotoAt,
    handleSubmit,
  };
}
