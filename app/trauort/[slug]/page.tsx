import Link from "next/link";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { VenueGallery } from "@/components/VenueGallery";
import { contentTranslations } from "@/lib/content-translations";
import { defaultLocale, getDictionary, hreflangForLocale, indexableLocales, isLocale, withLocalePath, type Locale } from "@/lib/i18n";
import { ceremonyVenueByRouteKey, ceremonyVenuePath, publicCeremonyVenues } from "@/lib/public-venues";
import { swissRegistryOffices } from "@/lib/registry-data";
import { ceremonyVenueGallery } from "@/lib/safe-media";
import { repairText } from "@/lib/search-experience";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";
import type { CeremonyVenue } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

type DetailItem = { label: string; value: string };

function DetailSection({ title, items }: { title: string; items: DetailItem[] }) {
  if (!items.length) return null;
  return (
    <section className="rounded-xl border border-linen bg-white p-5 shadow-soft">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <dl className="mt-4 grid gap-4 text-sm text-soft-ink sm:grid-cols-2">
        {items.map((item) => <div key={item.label}><dt className="font-semibold text-ink">{item.label}</dt><dd className="mt-1">{item.value}</dd></div>)}
      </dl>
    </section>
  );
}

function booleanLabel(value: boolean | null | undefined, yes: string, no: string) {
  return value == null ? "" : value ? yes : no;
}

function ceremonyDays(venue: CeremonyVenue, dictionary: Record<string, string>) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
  return days
    .filter((day) => venue[`ceremony${day[0].toUpperCase()}${day.slice(1)}` as keyof CeremonyVenue] === true)
    .map((day) => dictionary[`weekday.short.${day}`])
    .join(", ");
}

export function generateStaticParams() {
  return publicCeremonyVenues.map((venue) => ({ slug: venue.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const venue = ceremonyVenueByRouteKey(slug);
  if (!venue) return {};
  const rawLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";
  const path = ceremonyVenuePath(venue);
  const localizedPath = withLocalePath(path, locale);
  return {
    ...createMetadata({
      title: `${repairText(venue.traulokal_name)} – ziviler Trauort`,
      description: repairText(venue.beschreibung || `${venue.traulokal_name} in ${venue.ort}`),
      path: localizedPath
    }),
    alternates: {
      canonical: `${baseUrl}${localizedPath}`,
      languages: {
        ...Object.fromEntries(indexableLocales.map((item) => [hreflangForLocale(item), `${baseUrl}${withLocalePath(path, item)}`])),
        "x-default": `${baseUrl}${path}`
      }
    }
  };
}

export default async function CeremonyVenueDetailPage({ params }: Props) {
  const { slug } = await params;
  const venue = ceremonyVenueByRouteKey(slug);
  if (!venue) notFound();
  const rawLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  if (slug !== venue.slug) permanentRedirect(withLocalePath(ceremonyVenuePath(venue), locale));
  const dictionary = await getDictionary(locale);
  const t = (key: string) => dictionary[key] ?? key;
  const office = swissRegistryOffices.find((item) =>
    item.canonicalId === venue.standesamt_id || item.id === venue.standesamt_id || item.slug === venue.standesamt_id
  );
  const canonicalId = venue.canonicalId!;
  const translations = await contentTranslations("wedding_venue", [canonicalId], locale, "description");
  const description = repairText(translations.get(canonicalId) || venue.beschreibung);
  const media = ceremonyVenueGallery(venue);
  const externalUrl = venue.venueUrl?.startsWith("https://") ? venue.venueUrl : "";
  const sourceUrl = venue.sourceUrl?.startsWith("https://") ? venue.sourceUrl : "";
  const path = withLocalePath(ceremonyVenuePath(venue), locale);
  const yes = t("common.yes");
  const no = t("common.no");
  const days = ceremonyDays(venue, dictionary);
  const locationItems = [
    venue.adresse ? { label: t("office.field.address"), value: repairText(venue.adresse) } : null,
    venue.ort ? { label: t("venue.field.municipality"), value: repairText(venue.ort) } : null,
    venue.kanton ? { label: t("venue.field.canton"), value: repairText(venue.kanton) } : null
  ].filter((item): item is DetailItem => item !== null);
  const ceremonyItems = [
    venue.officialConfirmed != null ? { label: t("verification.field.official_ceremony_possible"), value: booleanLabel(venue.officialConfirmed, yes, no) } : null,
    days ? { label: t("office.field.possibleWeddingDays"), value: days } : null,
    venue.ceremonyDaysNote ? { label: t("verification.field.conditions"), value: repairText(venue.ceremonyDaysNote) } : null,
    venue.ceremonyTimes ? { label: t("office.field.generalWeddingTimes"), value: repairText(venue.ceremonyTimes) } : null,
    venue.ceremonySaturday != null ? { label: t("office.field.saturdayWedding"), value: booleanLabel(venue.ceremonySaturday, yes, no) } : null,
    venue.eveningCeremonyAvailable != null ? { label: t("office.field.eveningWedding"), value: booleanLabel(venue.eveningCeremonyAvailable, yes, no) } : null,
    typeof venue.maxCeremonyGuests === "number" && venue.maxCeremonyGuests > 0 ? { label: t("office.field.maxGuests"), value: String(venue.maxCeremonyGuests) } : null,
    venue.capacityNote ? { label: t("venue.field.capacityNote"), value: repairText(venue.capacityNote) } : null,
    venue.reservationRequired != null ? { label: t("verification.field.reservation_required"), value: booleanLabel(venue.reservationRequired, yes, no) } : null
  ].filter((item): item is DetailItem => item !== null);
  const equipmentItems = [
    venue.indoor != null ? { label: t("verification.field.indoor"), value: booleanLabel(venue.indoor, yes, no) } : null,
    venue.outdoorCeremonyAvailable != null ? { label: t("office.field.outdoorWedding"), value: booleanLabel(venue.outdoorCeremonyAvailable, yes, no) } : null,
    venue.wheelchairAccessible != null ? { label: t("office.field.wheelchairAccessible"), value: booleanLabel(venue.wheelchairAccessible, yes, no) } : null,
    venue.parkingDescription ? { label: t("office.field.parking"), value: repairText(venue.parkingDescription) } : venue.parkingAvailable != null ? { label: t("office.field.parking"), value: booleanLabel(venue.parkingAvailable, yes, no) } : null,
    venue.seasonalAvailability ? { label: t("office.field.seasonalUse"), value: repairText(venue.seasonalAvailability) } : null,
    venue.tags?.length ? { label: t("office.field.specialFeatures"), value: venue.tags.map(repairText).join(", ") } : null
  ].filter((item): item is DetailItem => item !== null);
  const additionalItems = [
    venue.remarks ? { label: t("verification.field.conditions"), value: repairText(venue.remarks) } : null,
    venue.beautyStatus ? { label: t("venue.field.classification"), value: repairText(venue.beautyStatus) } : null
  ].filter((item): item is DetailItem => item !== null);

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: t("nav.home"), url: `https://hochzeitstandesamt.ch${withLocalePath("/", locale)}` },
        ...(office ? [{ name: repairText(office.name), url: `https://hochzeitstandesamt.ch${withLocalePath(`/zivilstandsamt/${office.slug}`, locale)}` }] : []),
        { name: repairText(venue.traulokal_name), url: `https://hochzeitstandesamt.ch${path}` }
      ])) }} />
      <section>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{repairText([venue.ort, venue.kanton].filter(Boolean).join(" · "))}</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{repairText(venue.traulokal_name)}</h1>
          {description ? <p className="mt-4 text-lg leading-8 text-soft-ink">{description}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {office ? <Link href={withLocalePath(`/zivilstandsamt/${office.slug}`, locale)} className="focus-ring inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white">{repairText(office.name)}</Link> : null}
          </div>
        </div>
      </section>
      <VenueGallery
        images={media}
        openLabel={t("gallery.open")}
        closeLabel={t("gallery.close")}
        previousLabel={t("gallery.previous")}
        nextLabel={t("gallery.next")}
        moreLabel={t("gallery.more")}
        placeholderLabel={t("media.placeholder")}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <DetailSection title={t("venue.section.location")} items={locationItems} />
        <DetailSection title={t("venue.section.ceremony")} items={ceremonyItems} />
        <DetailSection title={t("venue.section.equipment")} items={equipmentItems} />
        <DetailSection title={t("venue.section.additional")} items={additionalItems} />
      </div>
      {(externalUrl || sourceUrl) ? <section className="rounded-xl border border-linen bg-white p-5 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">{t("venue.section.links")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {externalUrl ? <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage">{t("office.action.website")} ↗</a> : null}
          {sourceUrl && sourceUrl !== externalUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage">{t("venue.action.source")} ↗</a> : null}
        </div>
      </section> : null}
    </main>
  );
}
