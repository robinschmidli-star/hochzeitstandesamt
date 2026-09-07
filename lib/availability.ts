export type AvailabilityStatus = "available" | "unavailable" | "unknown" | "stale" | "source_error" | "manual_check" | "not_supported";
export type AvailabilitySourceType = "api" | "ics" | "calendar_page" | "booking_system" | "structured_webpage";

export type NormalizedAvailability = {
  sourceType: AvailabilitySourceType;
  sourceUrl?: string;
  lastCheckedAt?: string;
  lastSuccessAt?: string;
  status: AvailabilityStatus;
  nextAvailableDate?: string;
  confidence?: number;
  errorState?: string;
};

export function normalizeAvailability(value: NormalizedAvailability, now = new Date()): NormalizedAvailability {
  if (value.nextAvailableDate && !validDateOnly(value.nextAvailableDate)) return { ...value, status: "source_error", errorState: "invalid_date" };
  if (!value.lastCheckedAt) return { ...value, status: value.status === "unavailable" ? "unknown" : value.status };
  const checkedAt = new Date(value.lastCheckedAt);
  if (Number.isNaN(checkedAt.getTime())) return { ...value, status: "source_error", errorState: "invalid_last_checked_at" };
  if (now.getTime() - checkedAt.getTime() > 24 * 60 * 60 * 1000 && value.status !== "source_error") return { ...value, status: "stale" };
  return value;
}

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
  stale: "Daten möglicherweise veraltet",
  source_error: "Verfügbarkeit kann derzeit nicht geladen werden",
  manual_check: "Beim Amt prüfen",
  not_supported: "Keine Online-Prüfung bekannt"
};
