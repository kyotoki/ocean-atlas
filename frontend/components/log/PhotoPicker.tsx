import { Ionicons } from "@expo/vector-icons";
import type { ImagePickerAsset } from "expo-image-picker";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, radius, spacing, typography } from "../../constants/theme";
import WaveSpinner from "../ui/WaveSpinner";

interface PhotoPickerProps {
  photos: ImagePickerAsset[];
  isUploading: boolean;
  isSubmitting: boolean;
  onTakePhoto: () => void;
  onChoosePhotos: () => void;
  onRemovePhotoAt: (index: number) => void;
}

export default function PhotoPicker({
  photos,
  isUploading,
  isSubmitting,
  onTakePhoto,
  onChoosePhotos,
  onRemovePhotoAt,
}: PhotoPickerProps) {
  return (
    <>
      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoPreviewRow}
        >
          {photos.map((asset, index) => (
            <View key={asset.assetId ?? asset.uri} style={styles.photoPreviewWrap}>
              <Image source={{ uri: asset.uri }} style={styles.photoPreview} />
              {isUploading && (
                <View style={styles.photoUploadingOverlay}>
                  <WaveSpinner size="small" color={colors.text.inverse} />
                </View>
              )}
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => onRemovePhotoAt(index)}
                hitSlop={8}
                disabled={isSubmitting}
              >
                <Ionicons
                  name="close-circle"
                  size={26}
                  color={isSubmitting ? colors.text.disabled : colors.error}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={styles.photoButtonsRow}>
        <TouchableOpacity
          style={styles.photoButton}
          onPress={onTakePhoto}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          <Ionicons name="camera-outline" size={20} color={colors.primary} />
          <Text style={styles.photoButtonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.photoButton}
          onPress={onChoosePhotos}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          <Ionicons name="image-outline" size={20} color={colors.primary} />
          <Text style={styles.photoButtonText}>Choose Photos</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  photoButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  photoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.strong,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  photoButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
  },
  photoPreviewRow: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  photoPreviewWrap: {
    alignSelf: "flex-start",
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: radius.lg,
    backgroundColor: colors.border.default,
  },
  photoUploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    backgroundColor: colors.overlay.modalScrim,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.surface.card,
    borderRadius: radius.full,
  },
});
