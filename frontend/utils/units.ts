export type UnitSystem = "metric" | "imperial";

const METERS_TO_FEET = 3.28084;

export function metersToFeet(meters: number): number {
  return meters * METERS_TO_FEET;
}

export function feetToMeters(feet: number): number {
  return feet / METERS_TO_FEET;
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/** Depth stored in meters (canonical, always what the backend holds) -> a
 * display string in whichever unit system is active. */
export function formatDepth(meters: number, unitSystem: UnitSystem): string {
  if (unitSystem === "imperial") {
    return `${metersToFeet(meters).toFixed(1)} ft`;
  }
  return `${meters.toFixed(1)} m`;
}

/** Temperature stored in Celsius (canonical) -> a display string in whichever
 * unit system is active. */
export function formatTemperature(celsius: number, unitSystem: UnitSystem): string {
  if (unitSystem === "imperial") {
    return `${celsiusToFahrenheit(celsius).toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
}

export function depthUnitLabel(unitSystem: UnitSystem): string {
  return unitSystem === "imperial" ? "ft" : "m";
}
