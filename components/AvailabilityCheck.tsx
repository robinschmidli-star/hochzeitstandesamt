"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/components/Analytics";
import { availabilityForDate, availabilityLabels, type AvailabilityStatus } from "@/lib/availability";
import { browserId } from "@/lib/browser-identity";

type Schedule = Partial<Record<"monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday", boolean | null>>;

export function AvailabilityCheck({ venueId, venueSlug, officeId, schedule, officialUrl, labels = {}, language = "de", hasCalendar = false, compact = false }: {
  venueId: string; venueSlug: string; officeId?: string; schedule: Schedule; officialUrl?: string;
  labels?: Record<string, string>; language?: string; hasCalendar?: boolean; compact?: boolean;
}) {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<AvailabilityStatus>("unknown");
  const viewed = useRef(false);
  const hasOfficialCheck = Boolean(officialUrl?.startsWith("https://"));
  const t = (key: string) => labels[key] ?? key;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hs_last_search") ?? "null") as { date?: string } | null;
      if (saved?.date) setDate(saved.date);
    } catch { /* malformed search persistence is ignored */ }
  }, []);
  useEffect(() => {
    if (!hasCalendar || viewed.current) return;
    viewed.current = true;
    track("calendar_viewed", { venueId, venueSlug });
  }, [hasCalendar, venueId, venueSlug]);

  const statusClass = useMemo(() => status === "unavailable" ? "bg-red-50 text-red-800" : status === "manual_check" ? "bg-champagne/15 text-sage" : "bg-paper text-soft-ink", [status]);
  function checkDate() {
    const next = availabilityForDate(date, schedule, hasOfficialCheck);
    setStatus(next);
    const properties = { venue_id: venueId, venue_slug: venueSlug, ...(officeId ? { civil_registry_office_id: officeId } : {}), language, date, availability_status: next };
    track("availability_clicked", properties);
    track("date_checked", properties);
    if (next === "unavailable") track("availability_no_match", { venueId, venueSlug, date });
    try {
      void fetch("/api/preferences/availability", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ visitorId: browserId("hs_visitor", localStorage), sessionId: browserId("hs_session", sessionStorage), venueId, venueSlug, officeId, requestedDate: date, availabilityStatus: next })
      }).catch(() => undefined);
    } catch { /* intent persistence is non-blocking */ }
  }
  function officialClick() { track("official_link_clicked", { venue_id: venueId, venue_slug: venueSlug, ...(officeId ? { civil_registry_office_id: officeId } : {}), language, date: date || "none", availability_status: status }); }

  return <section className={compact ? "mt-4 border-t border-linen pt-4" : "rounded-xl border border-linen bg-white p-5 shadow-soft"} aria-labelledby={`availability-${venueId}`}>
    <h2 id={`availability-${venueId}`} className={compact ? "font-semibold text-ink" : "text-xl font-semibold text-ink"}>{t("availability.title")}</h2>
    <p className="mt-1 text-sm text-soft-ink">{t("availability.disclaimer")}</p>
    <div className="mt-3 flex flex-wrap items-end gap-2"><label className="grid gap-1 text-sm font-semibold text-ink">{t("availability.date")}<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setStatus("unknown"); }} className="focus-ring min-h-11 rounded-lg border border-linen bg-white px-3 font-normal" /></label><button type="button" disabled={!date} onClick={checkDate} className="focus-ring min-h-11 rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{t("availability.check")}</button></div>
    <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${statusClass}`} aria-live="polite">{labels[`availability.status.${status}`] ?? availabilityLabels[status]}</p>
    {hasCalendar ? <p className="mt-2 text-xs text-soft-ink">{t("availability.calendarAvailable")}</p> : <p className="mt-2 text-xs text-soft-ink">{t("availability.noLiveData")}</p>}
    {hasOfficialCheck ? <a href={officialUrl} onClick={officialClick} target="_blank" rel="noopener noreferrer" className="focus-ring mt-3 inline-flex min-h-11 items-center rounded-lg border border-sage/20 px-4 py-2 text-sm font-semibold text-sage">{t("availability.officialCheck")} ↗</a> : null}
  </section>;
}
