"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@/components/Analytics";
import { useFavorites } from "@/components/FavoritesProvider";
import { withLocalePath, type Dictionary, type Locale } from "@/lib/i18n";
import { AvailabilityCheck } from "@/components/AvailabilityCheck";

type ShortlistVenue = {
  canonicalId: string; slug: string; name: string; town: string; canton: string; officeName: string;
  officeId?: string; maxGuests: number | null; saturday: boolean | null; outdoor: boolean | null;
  officialUrl?: string; hasCalendar: boolean;
  schedule: Partial<Record<"monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday", boolean | null>>;
};

export function ShortlistPageClient({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const { favorites, ready, remove } = useFavorites();
  const tracked = useRef(false);
  const [venues, setVenues] = useState<ShortlistVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const t = (key: string) => dictionary[key] ?? key;

  useEffect(() => {
    if (!ready || tracked.current) return;
    tracked.current = true;
    track("shortlist_viewed", { favoriteCount: favorites.length, venueIds: favorites.slice(0, 20).map((item) => item.canonicalId) });
  }, [ready, favorites]);
  useEffect(() => {
    if (!ready) return;
    if (!favorites.length) { setVenues([]); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    void fetch("/api/preferences/venues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ venueIds: favorites.map((item) => item.canonicalId) }), signal: controller.signal })
      .then(async (response) => response.ok ? response.json() as Promise<{ venues: ShortlistVenue[] }> : { venues: [] })
      .then((result) => setVenues(result.venues)).catch(() => setVenues([])).finally(() => setLoading(false));
    return () => controller.abort();
  }, [ready, favorites]);

  if (!ready || loading) return <p className="text-soft-ink">{t("shortlist.loading")}</p>;
  if (!venues.length) return <section className="rounded-xl border border-linen bg-white p-8 text-center shadow-soft">
    <h1 className="text-3xl font-semibold text-ink">{t("shortlist.emptyTitle")}</h1>
    <p className="mt-3 text-soft-ink">{t("shortlist.emptyText")}</p>
    <Link href={withLocalePath("/?tag=featured#results", locale)} className="focus-ring mt-5 inline-flex min-h-11 items-center rounded-lg bg-sage px-5 py-3 font-semibold text-white">{t("shortlist.discover")}</Link>
  </section>;

  return <>
    <div><p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{t("shortlist.eyebrow")}</p><h1 className="mt-2 text-4xl font-semibold text-ink">{t("shortlist.title")}</h1><p className="mt-3 text-soft-ink">{t("shortlist.count").replace("{count}", String(venues.length))}</p></div>
    <div className="grid gap-4 lg:grid-cols-2">
      {venues.map((venue) => {
        return <article key={venue.canonicalId} className="rounded-xl border border-linen bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">{venue.town} · {venue.canton}</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">{venue.name}</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="font-semibold text-ink">{t("office.field.maxGuests")}</dt><dd className="text-soft-ink">{venue.maxGuests ?? t("shortlist.unknown")}</dd></div><div><dt className="font-semibold text-ink">{t("shortlist.saturday")}</dt><dd className="text-soft-ink">{venue.saturday == null ? t("shortlist.check") : venue.saturday ? t("common.yes") : t("common.no")}</dd></div><div><dt className="font-semibold text-ink">{t("shortlist.outdoor")}</dt><dd className="text-soft-ink">{venue.outdoor == null ? t("shortlist.check") : venue.outdoor ? t("common.yes") : t("common.no")}</dd></div><div><dt className="font-semibold text-ink">{t("shortlist.availability")}</dt><dd className="text-soft-ink">{t("availability.status.manual_check")}</dd></div></dl>
        <p className="mt-4 text-sm text-soft-ink">{t("homeSearch.responsibleOffice")}: {venue.officeName}</p>
        <AvailabilityCheck compact venueId={venue.canonicalId} venueSlug={venue.slug} officeId={venue.officeId} officialUrl={venue.officialUrl} labels={Object.fromEntries(Object.entries(dictionary).filter(([key]) => key.startsWith("availability.")))} language={locale} hasCalendar={venue.hasCalendar} schedule={venue.schedule} />
        <div className="mt-5 flex flex-wrap gap-2"><Link href={withLocalePath(`/trauort/${venue.slug}`, locale)} className="focus-ring inline-flex min-h-11 items-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white">{t("shortlist.details")}</Link><button type="button" onClick={() => remove(venue.canonicalId!, "shortlist")} className="focus-ring min-h-11 rounded-lg border border-sage/20 px-4 py-2 text-sm font-semibold text-sage">{t("shortlist.remove")}</button></div>
      </article>;
      })}
    </div>
  </>;
}
