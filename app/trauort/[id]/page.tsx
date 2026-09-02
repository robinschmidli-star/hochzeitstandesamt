import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SafeMediaFrame } from "@/components/SafeMediaFrame";
import { contentTranslations } from "@/lib/content-translations";
import { defaultLocale, getDictionary, hreflangForLocale, indexableLocales, isLocale, withLocalePath, type Locale } from "@/lib/i18n";
import { publicCeremonyVenues } from "@/lib/public-venues";
import { swissRegistryOffices } from "@/lib/registry-data";
import { ceremonyVenueMedia } from "@/lib/safe-media";
import { repairText } from "@/lib/search-experience";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return publicCeremonyVenues.map((venue) => ({ id: venue.canonicalId! }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const venue = publicCeremonyVenues.find((item) => item.canonicalId === id);
  if (!venue) return {};
  const rawLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";
  const path = `/trauort/${id}`;
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
  const { id } = await params;
  const venue = publicCeremonyVenues.find((item) => item.canonicalId === id);
  if (!venue) notFound();
  const rawLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = await getDictionary(locale);
  const t = (key: string) => dictionary[key] ?? key;
  const office = swissRegistryOffices.find((item) => item.id === venue.standesamt_id || item.slug === venue.standesamt_id);
  const translations = await contentTranslations("wedding_venue", [id], locale, "description");
  const description = repairText(translations.get(id) || venue.beschreibung);
  const media = ceremonyVenueMedia(venue);
  const externalUrl = venue.venueUrl?.startsWith("https://") ? venue.venueUrl : "";
  const path = withLocalePath(`/trauort/${id}`, locale);

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: t("nav.home"), url: `https://hochzeitstandesamt.ch${withLocalePath("/", locale)}` },
        ...(office ? [{ name: repairText(office.name), url: `https://hochzeitstandesamt.ch${withLocalePath(`/zivilstandsamt/${office.slug}`, locale)}` }] : []),
        { name: repairText(venue.traulokal_name), url: `https://hochzeitstandesamt.ch${path}` }
      ])) }} />
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{repairText([venue.ort, venue.kanton].filter(Boolean).join(" · "))}</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{repairText(venue.traulokal_name)}</h1>
          {description ? <p className="mt-4 text-lg leading-8 text-soft-ink">{description}</p> : null}
          <dl className="mt-6 grid gap-4 text-sm text-soft-ink sm:grid-cols-2">
            {venue.adresse || venue.ort ? <div><dt className="font-semibold text-ink">{t("office.field.address")}</dt><dd>{repairText([venue.adresse, venue.ort].filter(Boolean).join(", "))}</dd></div> : null}
            {typeof venue.maxCeremonyGuests === "number" ? <div><dt className="font-semibold text-ink">{t("office.field.maxGuests")}</dt><dd>{venue.maxCeremonyGuests}</dd></div> : null}
            <div><dt className="font-semibold text-ink">{t("office.field.wheelchairAccessible")}</dt><dd>{venue.wheelchairAccessible == null ? t("common.noInformationAvailable") : venue.wheelchairAccessible ? t("common.yes") : t("common.no")}</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            {office ? <Link href={withLocalePath(`/zivilstandsamt/${office.slug}`, locale)} className="focus-ring inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white">{repairText(office.name)}</Link> : null}
            {externalUrl ? <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30">{t("office.action.website")} ↗</a> : null}
          </div>
        </div>
        <div className="h-72 overflow-hidden rounded-xl border border-linen bg-linen/40 shadow-soft">
          <SafeMediaFrame media={media} className="h-full w-full" placeholderLabel={t("media.placeholder")} />
        </div>
      </section>
    </main>
  );
}
