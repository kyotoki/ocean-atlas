import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import {
  FIELD_BORDER,
  FIELD_FILL,
  FIELD_PADDING_HORIZONTAL,
  FIELD_PADDING_VERTICAL,
  FIELD_RADIUS,
} from "../../constants/fieldStyle";
import { formatDateISO } from "../../utils/date";

interface DateOfAdventureFieldProps {
  value: Date;
  onChange: (date: Date) => void;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DateOfAdventureField({ value, onChange }: DateOfAdventureFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // react-native-community/datetimepicker has no web implementation - its
  // fallback component renders null and just console.warns "not supported on:
  // web" - so on web this row needs to fall back to a native HTML date
  // input instead of silently doing nothing when tapped. That input is
  // wrapped in a real <label> (rather than just sitting inside a plain View)
  // so a click anywhere in the row - not just directly on the small input -
  // focuses it and opens the picker, per standard HTML label behavior.
  if (Platform.OS === "web") {
    return React.createElement(
      "label",
      { style: webRowStyle },
      <View style={styles.rowLeft} key="left">
        <View style={styles.iconBadge}>
          <Ionicons name="calendar-outline" size={17} color="#0B3D91" />
        </View>
        <Text style={styles.rowLabel}>Date of Adventure</Text>
      </View>,
      React.createElement("input", {
        key: "input",
        type: "date",
        value: formatDateISO(value),
        max: formatDateISO(new Date()),
        onChange: (event: { target: { value: string } }) => {
          const [year, month, day] = event.target.value.split("-").map(Number);
          if (year && month && day) {
            onChange(new Date(year, month - 1, day));
          }
        },
        style: webInputStyle,
      })
    );
  }

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode: "date",
        maximumDate: new Date(),
        onChange: (_event: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) {
            onChange(selectedDate);
          }
        },
      });
      return;
    }
    setIsPickerVisible(true);
  };

  return (
    <>
      <Pressable style={styles.row} onPress={openPicker}>
        <View style={styles.rowLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="calendar-outline" size={17} color="#0B3D91" />
          </View>
          <Text style={styles.rowLabel}>Date of Adventure</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowValue}>{formatDisplayDate(value)}</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </View>
      </Pressable>

      {isPickerVisible && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setIsPickerVisible(false)}
        >
          <Pressable style={styles.backdrop} onPress={() => setIsPickerVisible(false)}>
            <Pressable style={styles.pickerCard} onPress={(e) => e.stopPropagation()}>
              <DateTimePicker
                value={value}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    onChange(selectedDate);
                  }
                }}
              />
              <Pressable style={styles.doneButton} onPress={() => setIsPickerVisible(false)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

// Raw CSS (not an RN StyleSheet object) since this styles a real DOM <label>
// created via React.createElement rather than a react-native-web <View> -
// RN-only shorthands like paddingHorizontal/borderWidth don't apply here.
const webRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: FIELD_FILL,
  border: `1.5px solid ${FIELD_BORDER}`,
  borderRadius: FIELD_RADIUS,
  paddingLeft: FIELD_PADDING_HORIZONTAL,
  paddingRight: FIELD_PADDING_HORIZONTAL,
  paddingTop: FIELD_PADDING_VERTICAL,
  paddingBottom: FIELD_PADDING_VERTICAL,
  marginBottom: 18,
  cursor: "pointer",
} as const;

const webInputStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#0B3D91",
  border: "none",
  background: "transparent",
  textAlign: "right",
  cursor: "pointer",
} as const;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: FIELD_FILL,
    borderWidth: 1.5,
    borderColor: FIELD_BORDER,
    borderRadius: FIELD_RADIUS,
    paddingHorizontal: FIELD_PADDING_HORIZONTAL,
    paddingVertical: FIELD_PADDING_VERTICAL,
    marginBottom: 18,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EAF6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#101828",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B3D91",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(4, 20, 35, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  pickerCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
  },
  doneButton: {
    backgroundColor: "#0B3D91",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
