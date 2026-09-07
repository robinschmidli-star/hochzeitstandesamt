export type AvailabilityStatus = "available" | "unavailable" | "unknown" | "manual_check" | "not_supported";

type WeekdayAvailability = Partial<Record<"monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday", boolean | null>>;
const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export function validDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function availabilityForDate(dateValue: string, schedule: WeekdayAvailability, hasOfficialCheck: boolean): AvailabilityStatus {
  if (!validDateOnly(dateValue)) return "unknown";
  const weekday = weekdays[new Date(`${dateValue}T00:00:00.000Z`).getUTCDay()];
  if (schedule[weekday] === false) return "unavailable";
  return hasOfficialCheck ? "manual_check" : "not_supported";
}

export const availabilityLabels: Record<AvailabilityStatus, string> = {
  available: "Verfügbar",
  unavailable: "An diesem Wochentag nicht angeboten",
  unknown: "Datum auswählen",
  manual_check: "Beim Amt prüfen",
  not_supported: "Keine Online-Prüfung bekannt"
};
