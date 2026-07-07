// Built from local Y/M/D getters (not toISOString, which converts to UTC and
// can shift the date by a day depending on the device's timezone).
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
