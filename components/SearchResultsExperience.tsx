import Link from "next/link";
import { SafeMediaFrame } from "@/components/SafeMediaFrame";
import { SearchLeadCapture } from "@/components/SearchLeadCapture";
import { swissRegistryOffices } from "@/lib/registry-data";
import { ceremonyVenueMedia, registryOfficeMedia } from "@/lib/safe-media";
import { featuredCeremonyVenues, searchExperienceOffices, repairText, type EnrichedRegistryOffice, type SearchParams } from "@/lib/search-experience";
import type { CeremonyVenue } from "@/lib/types";
import { discoveryHref, paginateResults } from "@/lib/discovery";
import type { Dictionary } from "@/lib/i18n";

export function RegistryOfficeCard({ office, dictionary, pathPrefix = "" }: { office: EnrichedRegistryOffice; dictionary: Dictionary; pathPrefix?: string }) {
  const officialUrl = office.website_url || office.officialUrl;
  const media = registryOfficeMedia(office);
  const t = (key: string) => dictionary[key] ?? key;

  return (
    <article className="grid gap-4 rounded-xl border border-linen bg-white p-4 shadow-soft sm:grid-cols-[140px_1fr]">
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-linen/70">
        <SafeMediaFrame media={media} className="h-full w-full" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">{office.city} · {office.canton}</p>
        <h3 className="mt-1 text-2xl font-semibold text-ink">{office.name}</h3>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-sage">{t("results.responsibleOffice")}</p>
        <p className="mt-2 text-sm leading-6 text-soft-ink">{t("results.officeDescription").replace("{canton}", office.cantonName).replace("{city}", office.city).replace("{municipalities}", office.responsibleMunicipalities.slice(0, 3).join(", "))}</p>
        {office.premiumVenueNames.length ? (
          <p className="mt-3 text-sm font-semibold text-ink">
            {office.premiumVenueNames.length === 1 ? t("results.oneVenue") : t("results.manyVenues").replace("{count}", String(office.premiumVenueNames.length))}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {office.premiumVenueNames.slice(0, 2).map((venue, index) => (
            <span key={`${venue}-${index}`} className="rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold text-sage">{venue}</span>
          ))}
          {office.available_weekdays.map((day) => (
            <span key={day} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-soft-ink">{t(`weekday.short.${day}`)}</span>
          ))}
          {office.saturday_weddings_available === true ? (
            <span className="rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold text-sage">{t("results.saturdayAvailable")}</span>
          ) : null}
          {office.elopementSuitable ? (
            <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage">{t("results.elopementSuitable")}</span>
          ) : null}
          {typeof office.distanceKm === "number" ? (
            <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage">{t("results.distance").replace("{distance}", String(Math.round(office.distanceKm)))}</span>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`${pathPrefix}/zivilstandsamt/${office.slug}`} className="focus-ring rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white">{t("featured.details")}</Link>
          {officialUrl?.startsWith("https://") ? (
            <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage">
              {t("results.officialPage")}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function FeaturedVenueCard({ venue, dictionary, pathPrefix = "", compact = false }: { venue: CeremonyVenue; dictionary: Dictionary; pathPrefix?: string; compact?: boolean }) {
  const media = ceremonyVenueMedia(venue);
  const officeSlug = swissRegistryOffices.find((office) => office.id === venue.standesamt_id || office.slug === venue.standesamt_id)?.slug;
  const t = (key: string) => dictionary[key] ?? key;

  return (
    <article className="overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
      <div className={`${compact ? "h-40" : "h-52"} bg-linen/70`}>
        <SafeMediaFrame media={media} className="h-full w-full" />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">
          {repairText([venue.ort, venue.kanton].filter(Boolean).join(" · "))}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-ink">
          {repairText(venue.traulokal_name)}
        </h3>
        {!compact ? <p className="mt-3 text-sm leading-6 text-soft-ink">
          {repairText(venue.beschreibung || venue.standesamt_name)}
        </p> : null}
        {typeof venue.maxCeremonyGuests === "number" && venue.maxCeremonyGuests > 0 ? <p className="mt-2 text-sm text-soft-ink">{t("office.field.maxGuests")}: {venue.maxCeremonyGuests}</p> : null}
        {venue.standesamt_name ? <p className="mt-2 text-xs leading-5 text-soft-ink">{t("homeSearch.responsibleOffice")}: {repairText(venue.standesamt_name)}</p> : null}
        {officeSlug ? <Link
          href={`${pathPrefix}/zivilstandsamt/${officeSlug}#trauorte`}
          className="focus-ring mt-4 inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white"
        >
          {t("featured.details")}
        </Link> : null}
      </div>
    </article>
  );
}

export function SearchResults({ params, dictionary, pathPrefix = "", initial = false }: {
  params: SearchParams;
  dictionary: Dictionary;
  pathPrefix?: string;
  initial?: boolean;
}) {
  const t = (key: string) => dictionary[key] ?? key;
  const venueMode = initial || params.tag === "featured";
  const matches = venueMode ? featuredCeremonyVenues(params) : searchExperienceOffices(params);
  const { items, page, pageCount, total } = paginateResults<CeremonyVenue | EnrichedRegistryOffice>(matches, params.page, initial ? 6 : 12);
  return (
    <section id="results" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="results-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="results-title" className="text-3xl font-semibold text-ink">{initial ? t("featured.title") : `${total} ${t(venueMode ? "results.venues" : "results.results")}`}</h2>
        {!initial ? <Link href={pathPrefix || "/"} className="focus-ring inline-flex min-h-11 items-center font-semibold text-sage">{t("discovery.reset")}</Link> : null}
      </div>
      <div className={`mt-5 grid gap-4 ${venueMode ? "md:grid-cols-2 lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        {items.map((item) => "traulokal_name" in item
          ? <FeaturedVenueCard key={item.canonicalId} venue={item} dictionary={dictionary} pathPrefix={pathPrefix} compact />
          : <RegistryOfficeCard key={item.slug} office={item} dictionary={dictionary} pathPrefix={pathPrefix} />)}
      </div>
      {total === 0 ? <div className="mt-4 rounded-xl border border-linen bg-white p-6 text-soft-ink">
        <p className="font-semibold text-ink">{t("nameSearch.noResults")}</p>
        <p className="mt-1">{t("nameSearch.noResultsHelp")}</p>
      </div> : null}
      {initial ? <Link href={discoveryHref({}, { submitted: "1" }, pathPrefix)} className="focus-ring mt-5 inline-flex min-h-12 items-center rounded-lg bg-sage px-5 py-3 font-semibold text-white">{t("featured.all")}</Link> : null}
      {!initial && pageCount > 1 ? <nav aria-label={t("discovery.pagination")} className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {page > 1 ? <Link href={discoveryHref(params, { page: String(page - 1) }, pathPrefix)} className="focus-ring inline-flex min-h-11 items-center rounded-lg border border-linen px-4 py-2 font-semibold text-sage">{t("discovery.previous")}</Link> : <span />}
        <p className="text-sm text-soft-ink">{t("discovery.page").replace("{page}", String(page)).replace("{pages}", String(pageCount))}</p>
        {page < pageCount ? <Link href={discoveryHref(params, { page: String(page + 1) }, pathPrefix)} className="focus-ring inline-flex min-h-11 items-center rounded-lg border border-linen px-4 py-2 font-semibold text-sage">{t("discovery.next")}</Link> : <span />}
      </nav> : null}
      {!initial && !venueMode && total > 0 ? <SearchLeadCapture params={params} /> : null}
    </section>
  );
}
