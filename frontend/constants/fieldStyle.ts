// Shared visual tokens for the "pill" form field treatment used across the
// Log Adventure form (FormField, ActivityTypePicker, DateOfAdventureField) so
// every input/selector in the form reads as one consistent system rather than
// three separately-tuned looks.
export const FIELD_RADIUS = 14;
// White, not the page's own "#F2F6FC" background - using the same color as
// the page made every field invisible until focused, since there was nothing
// to distinguish the pill's fill from the page behind it.
export const FIELD_FILL = "#FFFFFF";
export const FIELD_FILL_FOCUSED = "#FFFFFF";
// A soft but always-visible border at rest (not "transparent") so the field's
// shape reads clearly against the page even before it's focused.
export const FIELD_BORDER = "#D8E1EC";
export const FIELD_BORDER_FOCUSED = "#0B3D91";
export const FIELD_PADDING_HORIZONTAL = 16;
export const FIELD_PADDING_VERTICAL = 14;
