import Link from "next/link";
import { SafeMediaFrame } from "@/components/SafeMediaFrame";
import { HomeHeroSearchClient } from "@/components/HomeHeroSearchClient";
import { SwissMap } from "@/components/SwissMap";
import { publicCeremonyVenues } from "@/lib/public-venues";
import { swissRegistryOffices } from "@/lib/registry-data";
import { defaultLocale, type Dictionary, type Locale } from "@/lib/i18n";
import { registrySearchLabels } from "@/lib/registry-search-labels";
import { ceremonyVenueMedia } from "@/lib/safe-media";
import de from "@/locales/de.json";

function createTranslator(dictionary: Dictionary) {
  const fallback = de as Dictionary;
  return (key: string) => dictionary[key] ?? fallback[key] ?? key;
}

export function HomeHeroSearch({ dictionary, pathPrefix = "" }: { dictionary: Dictionary; pathPrefix?: string }) {
  const t = createTranslator(dictionary);

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-champagne">{t("hero.eyebrow")}</p>
        <h1 className="mt-4 max-w-5xl text-4xl font-semibold leading-[1.02] text-ink sm:text-6xl sm:leading-[0.98]">{t("hero.title")}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-soft-ink">{t("hero.subtitle")}</p>
        <HomeHeroSearchClient dictionary={dictionary} pathPrefix={pathPrefix} />
      </div>
    </section>
  );
}

export function PopularSearchLinks({ dictionary, pathPrefix = "" }: { dictionary: Dictionary; pathPrefix?: string }) {
  const t = createTranslator(dictionary);
  const links = [
    ["/search?tag=featured", t("popular.featured")],
    ["/search?tag=lake", t("popular.lake")],
    ["/search?tag=castle", t("popular.castle")]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 pt-0 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-ink">{t("popular.title")}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(([href, label]) => (
          <Link key={href} href={`${pathPrefix}${href}`} className="focus-ring rounded-xl border border-linen bg-white p-4 font-semibold text-ink shadow-soft transition hover:border-champagne hover:text-sage">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SwitzerlandMapSection({
  dictionary,
  locale = defaultLocale
}: {
  dictionary: Dictionary;
  locale?: Locale;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 lg:px-8">
      <SwissMap labels={registrySearchLabels(dictionary, locale)} />
    </section>
  );
}

export function FeaturedRegistryOffices({ dictionary, pathPrefix = "" }: { dictionary: Dictionary; pathPrefix?: string }) {
  const t = createTranslator(dictionary);
  const featured = publicCeremonyVenues
    .filter((venue) => venue.websitePriority?.startsWith("Top20:"))
    .sort((left, right) => left.websitePriority!.localeCompare(right.websitePriority!))
    .map((venue) => ({
      venue,
      officeSlug: swissRegistryOffices.find((office) => office.id === venue.standesamt_id || office.slug === venue.standesamt_id)?.slug
    }))
    .filter((item): item is { venue: (typeof publicCeremonyVenues)[number]; officeSlug: string } => Boolean(item.officeSlug));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{t("featured.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">{t("featured.title")}</h2>
        </div>
        <Link href={`${pathPrefix}/standesamt-finden`} className="text-sm font-semibold text-sage">{t("featured.all")}</Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featured.map(({ venue, officeSlug }) => (
          <article key={venue.canonicalId} className="overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
            <div className="flex h-40 items-center justify-center bg-linen/70">
              <SafeMediaFrame media={ceremonyVenueMedia(venue)} className="h-full w-full" />
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">Traulokal · {venue.ort || venue.kanton}</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{venue.traulokal_name}</h3>
              <p className="mt-3 text-sm leading-6 text-soft-ink">{venue.beschreibung || venue.standesamt_name}</p>
              <Link href={`${pathPrefix}/zivilstandsamt/${officeSlug}`} className="focus-ring mt-4 inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white">{t("featured.details")}</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomeGuideTeasers({ dictionary, pathPrefix = "" }: { dictionary: Dictionary; pathPrefix?: string }) {
  const t = createTranslator(dictionary);
  const guides = [
    [t("guides.saturday"), "/search?weekday=saturday&saturdayOnly=true"],
    [t("guides.reserve"), "/ratgeber/heiraten-schweiz-offizielle-informationen"],
    [t("guides.cost"), "/ratgeber/heiraten-schweiz-offizielle-informationen"],
    [t("guides.beautiful"), "/search?tag=romantic"],
    [t("guides.outside"), "/ratgeber/heiraten-schweiz-offizielle-informationen"]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-ink">{t("guides.title")}</h2>
      <div className="mt-5 rounded-2xl border border-champagne/40 bg-paper p-6 shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Euer Weg zum Ja-Wort</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h3 className="text-2xl font-semibold text-ink sm:text-3xl">Wie funktioniert eine standesamtliche Hochzeit in der Schweiz?</h3>
            <p className="mt-3 max-w-2xl leading-7 text-soft-ink">Von der Ehevorbereitung bis zur Trauung – die wichtigsten Schritte einfach erklärt.</p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-5" aria-label="Die fünf Schritte der Hochzeits-Journey">
              {["💍 Start", "📄 Vorbereitung", "🏛️ Trauort", "📅 Termin", "❤️ Heiraten"].map((step, index) => (
                <li key={step} className="flex flex-col items-start gap-2 text-sm font-semibold text-ink sm:flex-row sm:items-center sm:justify-between">
                  <span>{step}</span>
                  {index < 4 ? <span className="text-champagne" aria-hidden="true"><span className="sm:hidden">↓</span><span className="hidden sm:inline">→</span></span> : null}
                </li>
              ))}
            </ol>
          </div>
          <Link href={`${pathPrefix}/heiraten-schweiz`} className="focus-ring inline-flex w-fit rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
            Hochzeits-Journey entdecken →
          </Link>
        </div>
      </div>
      <h3 className="mt-8 text-xl font-semibold text-ink">Weitere Ratgeber</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {guides.map(([label, href]) => (
          <Link key={label} href={`${pathPrefix}${href}`} className="focus-ring rounded-xl border border-linen bg-white p-5 font-semibold text-ink shadow-soft transition hover:border-sage/25 hover:text-sage">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
