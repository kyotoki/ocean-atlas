import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActivityTypePicker from "../../components/log/ActivityTypePicker";
import WaveSpinner from "../../components/ui/WaveSpinner";
import { ENDPOINTS } from "../../constants/api";
import { usePreferences } from "../../contexts/PreferencesContext";
import { ActivityType } from "../../types/adventure";
import { useAuthedFetch } from "../../utils/api";
import { uploadPhoto } from "../../utils/uploadPhoto";
import { depthUnitLabel, feetToMeters } from "../../utils/units";

type SubmitStage = "idle" | "uploading-photo" | "saving";

interface FormState {
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

const INITIAL_FORM: FormState = {
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

export default function LogAdventureScreen() {
  const router = useRouter();
  const authedFetch = useAuthedFetch();
  const { unitSystem } = usePreferences();
  const isImperial = unitSystem === "imperial";
  const [activityType, setActivityType] = useState<ActivityType>("scuba");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitStage, setSubmitStage] = useState<SubmitStage>("idle");
  const isSubmitting = submitStage !== "idle";
  const isScuba = activityType === "scuba";

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera access needed",
        "Enable camera access in Settings to take a photo."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0]);
    }
  };

  const onChoosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo library access needed",
        "Enable photo library access in Settings to choose a photo."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0]);
    }
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }
    if (!form.location_name.trim()) {
      nextErrors.location_name = "Location name is required.";
    }

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

    const maxDepth = Number(form.max_depth_meters);
    if (form.max_depth_meters.trim() === "" || Number.isNaN(maxDepth) || maxDepth < 0) {
      nextErrors.max_depth_meters = `Enter a valid depth in ${depthUnitLabel(unitSystem)}.`;
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
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      let photoUrl: string | null = null;
      if (photo) {
        setSubmitStage("uploading-photo");
        try {
          photoUrl = await uploadPhoto(authedFetch, ENDPOINTS.uploads, photo);
        } catch {
          throw new Error("Unable to upload photo. Check your connection and try again.");
        }
      }

      setSubmitStage("saving");
      const response = await authedFetch(ENDPOINTS.adventures, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          location_name: form.location_name.trim(),
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          max_depth_meters: isImperial
            ? feetToMeters(Number(form.max_depth_meters))
            : Number(form.max_depth_meters),
          duration_minutes: Number(form.duration_minutes),
          notes: form.notes.trim() ? form.notes.trim() : null,
          photo_url: photoUrl,
          activity_type: activityType,
          tank_pressure_bar:
            isScuba && form.tank_pressure_bar.trim() ? Number(form.tank_pressure_bar) : null,
          gas_mix: isScuba && form.gas_mix.trim() ? form.gas_mix.trim() : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      setForm(INITIAL_FORM);
      setPhoto(null);
      setActivityType("scuba");
      Alert.alert("Adventure logged", "Your dive has been added to the Ocean Map.", [
        { text: "View Map", onPress: () => router.push("/") },
        { text: "Log Another", style: "cancel" },
      ]);
    } catch (err) {
      Alert.alert(
        "Unable to save adventure",
        err instanceof Error ? err.message : "Check that the Ocean Atlas server is running."
      );
    } finally {
      setSubmitStage("idle");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SafeAreaView style={styles.flex} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ActivityTypePicker value={activityType} onChange={setActivityType} />

          <Text style={styles.sectionLabel}>DIVE DETAILS</Text>

          <FormField
            label="Title"
            placeholder="e.g. Coral Garden Drift Dive"
            value={form.title}
            onChangeText={(v) => updateField("title", v)}
            error={errors.title}
          />

          <FormField
            label="Location Name"
            placeholder="e.g. Great Barrier Reef"
            value={form.location_name}
            onChangeText={(v) => updateField("location_name", v)}
            error={errors.location_name}
          />

          <View style={styles.row}>
            <FormField
              label="Latitude"
              placeholder="-16.7500"
              value={form.latitude}
              onChangeText={(v) => updateField("latitude", v)}
              error={errors.latitude}
              keyboardType="numbers-and-punctuation"
              containerStyle={styles.halfField}
            />
            <FormField
              label="Longitude"
              placeholder="145.6667"
              value={form.longitude}
              onChangeText={(v) => updateField("longitude", v)}
              error={errors.longitude}
              keyboardType="numbers-and-punctuation"
              containerStyle={styles.halfField}
            />
          </View>

          <Text style={styles.sectionLabel}>DIVE METRICS</Text>

          <View style={styles.row}>
            <FormField
              label={`Max Depth (${depthUnitLabel(unitSystem)})`}
              placeholder={isImperial ? "60" : "18"}
              value={form.max_depth_meters}
              onChangeText={(v) => updateField("max_depth_meters", v)}
              error={errors.max_depth_meters}
              keyboardType="numeric"
              containerStyle={styles.halfField}
            />
            <FormField
              label="Duration (min)"
              placeholder="45"
              value={form.duration_minutes}
              onChangeText={(v) => updateField("duration_minutes", v)}
              error={errors.duration_minutes}
              keyboardType="numeric"
              containerStyle={styles.halfField}
            />
          </View>

          {isScuba && (
            <>
              <Text style={styles.sectionLabel}>SCUBA GEAR</Text>
              <View style={styles.row}>
                <FormField
                  label="Tank Pressure (bar)"
                  placeholder="200"
                  value={form.tank_pressure_bar}
                  onChangeText={(v) => updateField("tank_pressure_bar", v)}
                  error={errors.tank_pressure_bar}
                  keyboardType="numeric"
                  containerStyle={styles.halfField}
                />
                <FormField
                  label="Gas Mix"
                  placeholder="Air, Nitrox 32..."
                  value={form.gas_mix}
                  onChangeText={(v) => updateField("gas_mix", v)}
                  containerStyle={styles.halfField}
                />
              </View>
            </>
          )}

          <Text style={styles.sectionLabel}>NOTES</Text>
          <FormField
            label="Notes (optional)"
            placeholder="Wildlife spotted, conditions, gear used..."
            value={form.notes}
            onChangeText={(v) => updateField("notes", v)}
            multiline
            hideLabel
          />

          <Text style={styles.sectionLabel}>PHOTO</Text>
          {photo ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
              {submitStage === "uploading-photo" && (
                <View style={styles.photoUploadingOverlay}>
                  <WaveSpinner size="small" color="#FFFFFF" />
                  <Text style={styles.photoUploadingText}>Uploading...</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPhoto(null)}
                hitSlop={8}
                disabled={isSubmitting}
              >
                <Ionicons
                  name="close-circle"
                  size={26}
                  color={isSubmitting ? "#CBD5E1" : "#B00020"}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtonsRow}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={onTakePhoto}
                activeOpacity={0.85}
              >
                <Ionicons name="camera-outline" size={20} color="#0B3D91" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={onChoosePhoto}
                activeOpacity={0.85}
              >
                <Ionicons name="image-outline" size={20} color="#0B3D91" />
                <Text style={styles.photoButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <>
                <WaveSpinner size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {submitStage === "uploading-photo" ? "Uploading photo..." : "Saving..."}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Log Adventure</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  keyboardType?: "default" | "numeric" | "numbers-and-punctuation";
  multiline?: boolean;
  hideLabel?: boolean;
  containerStyle?: object;
}

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = "default",
  multiline = false,
  hideLabel = false,
  containerStyle,
}: FormFieldProps) {
  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      {!hideLabel && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error ? styles.inputError : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#F2F6FC",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5A6B87",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D9E6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#101828",
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: "#B00020",
  },
  fieldError: {
    marginTop: 4,
    fontSize: 12,
    color: "#B00020",
  },
  photoButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  photoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D9E6",
    borderRadius: 10,
    paddingVertical: 12,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B3D91",
  },
  photoPreviewWrap: {
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  photoPreview: {
    width: 140,
    height: 140,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
  },
  photoUploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    backgroundColor: "rgba(4, 20, 35, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoUploadingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0B3D91",
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
