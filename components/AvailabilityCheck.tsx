"use client";

import { useState } from "react";
import { track } from "@/components/Analytics";

type Schedule = Partial<Record<"monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday", boolean | null>>;
const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export function AvailabilityCheck({ venueId, venueSlug, officeId, schedule, officialUrl, language, labels }: {
  venueId: string; venueSlug: string; officeId?: string; schedule: Schedule; officialUrl?: string; language: string;
  labels: Record<string, string>;
}) {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"unknown" | "unavailable" | "manual_check">("unknown");
  const t = (key: string) => labels[key] ?? key;

  function check() {
    const value = new Date(`${date}T12:00:00Z`);
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(value.getTime()) && value.toISOString().slice(0, 10) === date;
    const weekday = valid ? weekdays[value.getUTCDay()] : undefined;
    const next = weekday && schedule[weekday] === false ? "unavailable" : valid ? "manual_check" : "unknown";
    setStatus(next);
    track("availability_clicked", { venue_id: venueId, venue_slug: venueSlug, ...(officeId ? { civil_registry_office_id: officeId } : {}), language, date, availability_status: next });
  }

  return <section className="rounded-xl border border-linen bg-white p-5 shadow-soft" aria-labelledby={`availability-${venueId}`}>
    <h2 id={`availability-${venueId}`} className="text-xl font-semibold text-ink">{t("availability.title")}</h2>
    <p className="mt-1 text-sm text-soft-ink">{t("availability.disclaimer")}</p>
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <label className="grid gap-1 text-sm font-semibold text-ink">{t("availability.date")}<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setStatus("unknown"); }} className="focus-ring min-h-11 rounded-lg border border-linen bg-white px-3 font-normal" /></label>
      <button type="button" disabled={!date} onClick={check} className="focus-ring min-h-11 rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{t("availability.check")}</button>
    </div>
    <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm font-semibold text-soft-ink" aria-live="polite">{t(`availability.status.${status}`)}</p>
    {officialUrl?.startsWith("https://") ? <a href={officialUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("official_link_clicked", { venue_id: venueId, venue_slug: venueSlug, language })} className="focus-ring mt-3 inline-flex min-h-11 items-center rounded-lg border border-sage/20 px-4 py-2 text-sm font-semibold text-sage">{t("availability.officialCheck")} ↗</a> : null}
  </section>;
}
