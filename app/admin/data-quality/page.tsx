import type { Metadata } from "next";
import { DataQualityTable, type DataQualityRow } from "@/components/DataQualityTable";
import { venueCompleteness } from "@/lib/data-quality";
import { publicCeremonyVenues } from "@/lib/public-venues";
import { swissRegistryOffices } from "@/lib/registry-data";

export const metadata: Metadata = { title: "Data Quality", robots: { index: false, follow: false } };

export default function DataQualityPage() {
  const rows: DataQualityRow[] = publicCeremonyVenues.map((venue) => {
    const weekdays = [venue.ceremonyMonday, venue.ceremonyTuesday, venue.ceremonyWednesday, venue.ceremonyThursday, venue.ceremonyFriday, venue.ceremonySaturday, venue.ceremonySunday];
    const quality = venueCompleteness({
      name: venue.traulokal_name, officeId: venue.standesamt_id, canton: venue.kanton, municipality: venue.ort,
      address: venue.adresse, ceremonyDays: weekdays.some((value) => value !== null && value !== undefined) ? weekdays : venue.ceremonyDaysNote,
      reservation: venue.reservationRequired, capacity: venue.maxCeremonyGuests ?? venue.capacityNote,
      indoor: venue.indoor, outdoor: venue.outdoorCeremonyAvailable, wheelchair: venue.wheelchairAccessible,
      parking: venue.parkingAvailable, season: venue.seasonalAvailability,
      officialUrl: venue.venueUrl, sourceUrl: venue.sourceUrl, imageUrl: venue.imageUrl,
      mediaFallbackStatus: venue.coatOfArmsUrl ? "coat_of_arms" : undefined,
      verificationStatus: venue.officialConfirmed == null ? undefined : venue.officialConfirmed,
      lastVerifiedAt: undefined
    });
    return { id: venue.canonicalId ?? venue.slug, venue: venue.traulokal_name, office: venue.standesamt_name,
      canton: venue.kanton, score: quality.score, missing: quality.missing,
      verification: venue.officialConfirmed == null ? "fehlt" : venue.officialConfirmed ? "bestätigt" : "nicht bestätigt", updatedAt: "" };
  });
  const counts = { Excellent: 0, Good: 0, "Needs Improvement": 0, Critical: 0 };
  rows.forEach((row) => counts[row.score >= 90 ? "Excellent" : row.score >= 75 ? "Good" : row.score >= 50 ? "Needs Improvement" : "Critical"]++);
  const average = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0;
  const gaps = (label: string) => rows.filter((row) => row.missing.includes(label)).length;
  const gapCards = [
    ["ohne Foto", publicCeremonyVenues.filter((venue) => !venue.imageUrl).length],
    ["ohne offizielle URL", gaps("Offizielle Quelle")], ["ohne Kapazität", gaps("Kapazität")],
    ["ohne Reservation", gaps("Reservation")], ["ohne Trautage", gaps("Trautage")],
    ["ohne Adresse", gaps("Adresse")], ["ohne Verification", gaps("Verification-Status")]
  ];
  const cards = [["Zivilstandsämter", swissRegistryOffices.length], ["Trauorte", rows.length], ["Ø Completeness", average],
    ["Excellent", counts.Excellent], ["Good", counts.Good], ["Needs Improvement", counts["Needs Improvement"]], ["Critical", counts.Critical]];
  const health = [["Canonical Drift", "wird im Deployment-Gate geprüft"], ["Letzte Datensynchronisation", "Build-Artefakt"],
    ["Letzte Migration", "Alembic 0016 / Prisma 20260906120000"], ["Availability", "Schema + API vorhanden"], ["Fehlerhafte Datensätze", String(rows.filter((row) => !row.id || !row.venue).length)]];
  return <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
    <div><p className="text-sm font-semibold uppercase tracking-widest text-champagne">Admin</p><h1 className="mt-2 text-4xl font-semibold text-ink">Data Quality</h1><p className="mt-2 text-soft-ink">Interne Sicht auf die aktuell veröffentlichte Datenrepräsentation.</p></div>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="rounded-xl border border-linen bg-white p-4 shadow-soft"><div className="text-2xl font-semibold">{value}</div><div className="text-sm text-soft-ink">{label}</div></div>)}</section>
    <section><h2 className="mb-3 text-2xl font-semibold">Datenlücken</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{gapCards.map(([label, count]) => <div key={label} className="rounded-xl border border-linen bg-white p-4"><span className="text-xl font-semibold">{count}</span> <span className="text-soft-ink">{label}</span></div>)}</div></section>
    <section><h2 className="mb-3 text-2xl font-semibold">Technical / Data Health</h2><dl className="grid gap-3 rounded-xl border border-linen bg-white p-5 sm:grid-cols-2">{health.map(([label, value]) => <div key={label}><dt className="text-sm text-soft-ink">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl></section>
    <section><h2 className="mb-3 text-2xl font-semibold">Priorisierung</h2><DataQualityTable rows={rows}/></section>
  </main>;
}
