import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  FIELD_BORDER,
  FIELD_BORDER_FOCUSED,
  FIELD_FILL,
  FIELD_FILL_FOCUSED,
  FIELD_PADDING_HORIZONTAL,
  FIELD_PADDING_VERTICAL,
  FIELD_RADIUS,
} from "../../constants/fieldStyle";
import { colors, elevation, spacing, typography } from "../../constants/theme";

export interface FormFieldProps {
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

export default function FormField({
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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      {!hideLabel && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.label,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: FIELD_FILL,
    borderWidth: 1.5,
    borderColor: FIELD_BORDER,
    borderRadius: FIELD_RADIUS,
    paddingHorizontal: FIELD_PADDING_HORIZONTAL,
    paddingVertical: FIELD_PADDING_VERTICAL,
    fontSize: typography.size.body,
    color: colors.text.primary,
  },
  inputFocused: {
    backgroundColor: FIELD_FILL_FOCUSED,
    borderColor: FIELD_BORDER_FOCUSED,
    shadowColor: FIELD_BORDER_FOCUSED,
    ...elevation.focus,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: FIELD_PADDING_VERTICAL,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    marginTop: spacing.xxs,
    fontSize: typography.size.caption,
    color: colors.error,
  },
});
