// Public projection only. Ambiguous source text is retained, never guessed.
export const text = (value) => value == null ? "" : String(value).trim();
export function number(value) {
  const raw = text(value);
  if (!/^[+-]?\d+(?:[.,]\d+)?$/.test(raw)) return null;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}
export function boolean(value) {
  if (value === true || /^(true|yes|ja|oui|si|sì|1)$/i.test(text(value))) return true;
  if (value === false || /^(false|no|nein|non|0)$/i.test(text(value))) return false;
  return null;
}
const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const describe = (value) => value == null ? "" : typeof value === "object" ? JSON.stringify(value) : text(value);
const pick = (...values) => values.find((value) => value !== null && value !== undefined && value !== "");

export function venueFacts(profile, old = {}) {
  const result = {};
  const notes = [];
  const canonicalDays = profile.ceremony_days;
  for (const day of days) {
    const field = `ceremony${day[0].toUpperCase()}${day.slice(1)}`;
    const raw = canonicalDays != null
      ? Array.isArray(canonicalDays)
        ? (canonicalDays.includes(day) ? true : null)
        : typeof canonicalDays === "object" ? canonicalDays[day] : null
      : pick(profile[`${day}_available`], old[field]);
    result[field] = boolean(raw);
    if (text(raw) && result[field] === null) notes.push(`${day}: ${describe(raw)}`);
  }
  if (canonicalDays != null && (
    typeof canonicalDays !== "object" ||
    (Array.isArray(canonicalDays) && canonicalDays.some((day) => !days.includes(day))) ||
    (!Array.isArray(canonicalDays) && Object.keys(canonicalDays).some((day) => !days.includes(day)))
  )) notes.push(describe(canonicalDays));
  // Keep legacy restrictions even when canonical days are available.
  for (const day of days) {
    const raw = profile[`${day}_available`];
    if (canonicalDays != null && text(raw) && boolean(raw) === null) notes.push(`${day}: ${describe(raw)}`);
  }
  result.ceremonyDaysNote = [...new Set(notes)].join("; ") || old.ceremonyDaysNote || "";
  const capacity = pick(profile.capacity_max, profile.max_personen, profile.max_personen_raw);
  const parsed = number(capacity);
  // No fallback to generated legacy zeroes: absent capacity remains unknown.
  result.maxCeremonyGuests = parsed !== null && Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
  result.capacityNote = [
    result.maxCeremonyGuests === null ? describe(capacity) : "",
    describe(profile.max_personen_raw), describe(profile.raume_kapazitat_detail)
  ].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index).join("; ");
  const parking = pick(profile.parking, profile.parkplatze);
  result.parkingAvailable = boolean(parking);
  result.parkingDescription = describe(parking);
  result.seasonalAvailability = describe(profile.seasonal_availability);
  result.ceremonyTimes = describe(pick(profile.ceremony_times, profile.ceremony_times_raw));
  result.indoor = boolean(pick(profile.indoor, profile.innenbereich));
  result.reservationRequired = boolean(profile.reservation_required);
  result.eveningCeremonyAvailable = boolean(pick(profile.evening_available, old.eveningCeremonyAvailable));
  result.outdoorCeremonyAvailable = boolean(pick(profile.outdoor, profile.aussenbereich, old.outdoorCeremonyAvailable));
  result.wheelchairAccessible = boolean(pick(profile.wheelchair_accessible, profile.rollstuhlgangig, old.wheelchairAccessible));
  return result;
}
