import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { readJSON, writeJSON } from "../utils/deviceStorage";
import { UnitSystem } from "../utils/units";

export type MapStyle = "standard" | "satellite" | "hybrid";

interface PreferencesState {
  unitSystem: UnitSystem;
  mapStyle: MapStyle;
}

const DEFAULT_PREFERENCES: PreferencesState = {
  unitSystem: "metric",
  mapStyle: "standard",
};

const STORAGE_KEY = "svel_preferences";

interface PreferencesContextValue extends PreferencesState {
  setUnitSystem: (unitSystem: UnitSystem) => void;
  setMapStyle: (mapStyle: MapStyle) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

// Unit system and map style are device-wide display preferences, not tied to
// a specific Clerk account (unlike bio/gear in profileStorage.ts), so they're
// stored under one fixed key rather than per-user.
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PreferencesState>(DEFAULT_PREFERENCES);

  useEffect(() => {
    readJSON(STORAGE_KEY, DEFAULT_PREFERENCES).then(setPreferences);
  }, []);

  const persist = (next: PreferencesState) => {
    setPreferences(next);
    writeJSON(STORAGE_KEY, next);
  };

  return (
    <PreferencesContext.Provider
      value={{
        ...preferences,
        setUnitSystem: (unitSystem) => persist({ ...preferences, unitSystem }),
        setMapStyle: (mapStyle) => persist({ ...preferences, mapStyle }),
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
