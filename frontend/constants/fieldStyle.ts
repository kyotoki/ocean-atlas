// Shared visual tokens for the "pill" form field treatment used across the
// Log Adventure form (FormField, ActivityTypePicker, DateOfAdventureField) so
// every input/selector in the form reads as one consistent system rather than
// three separately-tuned looks. Pulls from the app-wide design tokens
// (constants/theme.ts) rather than its own one-off values.
import { colors, radius, spacing } from "./theme";

export const FIELD_RADIUS = radius.md;
// White, not the page's own surface.page background - using the same color
// as the page made every field invisible until focused, since there was
// nothing to distinguish the pill's fill from the page behind it.
export const FIELD_FILL = colors.surface.card;
export const FIELD_FILL_FOCUSED = colors.surface.card;
// A soft but always-visible border at rest (not "transparent") so the field's
// shape reads clearly against the page even before it's focused.
export const FIELD_BORDER = colors.border.strong;
export const FIELD_BORDER_FOCUSED = colors.primary;
export const FIELD_PADDING_HORIZONTAL = spacing.md;
export const FIELD_PADDING_VERTICAL = spacing.md;
