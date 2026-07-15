import * as Sentry from "@sentry/react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

// A missing DSN (local dev, no env var set) disables the client entirely -
// same no-op pattern as the backend's sentry_sdk.init() in main.py, so
// nothing at any call site needs its own guard. `enabled` is set
// explicitly rather than relying on an unset dsn implying disabled, to
// match this codebase's convention of explicit guards over assumed SDK
// behavior (see utils/notifications.ts's isSupportedPlatform).
export function initSentry(): void {
  Sentry.init({
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ?? "development",
  });
}

export { Sentry };
