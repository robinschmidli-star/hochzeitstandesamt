import Link from "next/link";
import { SafeMediaFrame } from "@/components/SafeMediaFrame";
import { SearchLeadCapture } from "@/components/SearchLeadCapture";
import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import { ceremonyVenueMedia, registryOfficeMedia } from "@/lib/safe-media";
import { repairText, type EnrichedRegistryOffice, type SearchParams } from "@/lib/search-experience";
import type { CeremonyVenue } from "@/lib/types";
import { NameSearch } from "@/components/NameSearch";
import type { Dictionary } from "@/lib/i18n";

const weekdayLabels: Record<string, string> = {
  monday: "Mo",
  tuesday: "Di",
  wednesday: "Mi",
  thursday: "Do",
  friday: "Fr",
  saturday: "Sa",
  sunday: "So"
};

export function SearchFilters({ params, dictionary, pathPrefix = "" }: { params: SearchParams; dictionary: Dictionary; pathPrefix?: string }) {
  const t = (key: string) => dictionary[key] ?? key;
  return (
    <aside className="min-w-0 rounded-xl border border-linen bg-white p-4 shadow-soft sm:p-5">
      <h2 className="text-xl font-semibold text-ink">{t("results.filters")}</h2>
      <form action={`${pathPrefix}/search`} className="mt-4 grid gap-4">
        {params.name ? <input type="hidden" name="name" value={params.name} /> : null}
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("search.locationLabel")}
          <input name="location" defaultValue={params.location} placeholder={t("search.locationPlaceholder")} className="focus-ring h-11 rounded-lg border border-linen px-3 text-soft-ink" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="grid gap-2 text-sm font-medium text-ink">
            {t("search.radius")}
            <select name="radius" defaultValue={params.radius || "50"} className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            {t("checklist.canton")}
            <select name="canton" defaultValue={params.canton} className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
              <option value="">{t("search.allCantons")}</option>
              {registryCantons.map((canton) => (
                <option key={canton.code} value={canton.code}>{repairText(canton.name)}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("search.weekday")}
          <select name="weekday" defaultValue={params.weekday || ""} className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">{t("results.all")}</option>
            <option value="saturday">{t("search.saturday")}</option>
            <option value="friday">{t("search.friday")}</option>
            <option value="thursday">{t("search.thursday")}</option>
          </select>
        </label>
        <div className="grid gap-2">
          <label className="flex gap-3 text-sm text-soft-ink">
            <input name="saturdayOnly" value="true" defaultChecked={params.saturdayOnly === "true"} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-linen accent-sage" />
            {t("results.saturdayOnly")}
          </label>
          <label className="flex gap-3 text-sm text-soft-ink">
            <input name="elopement" value="true" defaultChecked={params.elopement === "true"} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-linen accent-sage" />
            {t("results.elopement")}
          </label>
          {[
            ["evening", "results.evening"],
            ["outdoor", "results.outdoor"],
            ["wheelchair", "results.wheelchair"],
            ["parking", "results.parking"],
            ["onlineBooking", "results.onlineBooking"],
            ["multipleVenues", "results.multipleVenues"]
          ].map(([name, labelKey]) => (
            <label key={name} className="flex gap-3 text-sm text-soft-ink">
              <input name={name} value="yes" defaultChecked={params[name as keyof SearchParams] === "yes"} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-linen accent-sage" />
              {t(labelKey)}
            </label>
          ))}
        </div>
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("results.minimumGuests")}
          <input name="maxGuests" defaultValue={params.maxGuests} type="number" min="1" max="1000" placeholder="z.B. 50" className="focus-ring h-11 rounded-lg border border-linen px-3 text-soft-ink" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          {t("results.style")}
          <select name="tag" defaultValue={params.tag || ""} className="focus-ring h-11 rounded-lg border border-linen bg-white px-3 text-soft-ink">
            <option value="">{t("results.all")}</option>
            <option value="featured">{t("tag.featured")}</option>
            <option value="castle">{t("tag.castle")}</option>
            <option value="lake">{t("tag.lake")}</option>
            <option value="mountains">{t("tag.mountains")}</option>
            <option value="historic">{t("tag.historic")}</option>
            <option value="modern">{t("tag.modern")}</option>
            <option value="romantic">{t("tag.romantic")}</option>
            <option value="city">{t("tag.city")}</option>
            <option value="nature">{t("tag.nature")}</option>
          </select>
        </label>
        <button className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white">{t("results.applyFilters")}</button>
      </form>
    </aside>
  );
}

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
        <h2 className="mt-1 text-2xl font-semibold text-ink">{office.name}</h2>
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
            <span key={day} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-soft-ink">{weekdayLabels[day] ?? day}</span>
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

function FeaturedVenueCard({ venue, dictionary, pathPrefix = "" }: { venue: CeremonyVenue; dictionary: Dictionary; pathPrefix?: string }) {
  const rank = Number(venue.websitePriority?.split(":")[1]);
  const media = ceremonyVenueMedia(venue);
  const officeSlug = swissRegistryOffices.find((office) => office.id === venue.standesamt_id || office.slug === venue.standesamt_id)?.slug;
  const t = (key: string) => dictionary[key] ?? key;

  return (
    <article className="overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
      <div className="h-52 bg-linen/70">
        <SafeMediaFrame media={media} className="h-full w-full" />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">
          {t("results.rank").replace("{rank}", String(rank))} · {repairText(venue.ort || venue.kanton)}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">
          {repairText(venue.traulokal_name)}
        </h2>
        <p className="mt-3 text-sm leading-6 text-soft-ink">
          {repairText(venue.beschreibung || venue.standesamt_name)}
        </p>
        {officeSlug ? <Link
          href={`${pathPrefix}/zivilstandsamt/${officeSlug}`}
          className="focus-ring mt-4 inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white"
        >
          {t("featured.details")}
        </Link> : null}
      </div>
    </article>
  );
}

export function FeaturedVenueResultsPage({
  params,
  venues,
  dictionary,
  pathPrefix = ""
}: {
  params: SearchParams;
  venues: CeremonyVenue[];
  dictionary: Dictionary;
  pathPrefix?: string;
}) {
  const t = (key: string) => dictionary[key] ?? key;
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">
          {t("results.curated")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
          {t("results.featuredTitle")}
        </h1>
        <p className="mt-3 max-w-3xl text-soft-ink">
          {t("results.featuredIntro")}
        </p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <SearchFilters params={params} dictionary={dictionary} pathPrefix={pathPrefix} />
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-ink">{venues.length} {t("results.venues")}</h2>
            <Link href={pathPrefix || "/"} className="text-sm font-semibold text-sage">{t("results.changeSearch")}</Link>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {venues.map((venue) => (
              <FeaturedVenueCard key={venue.canonicalId} venue={venue} dictionary={dictionary} pathPrefix={pathPrefix} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function SearchResultsPage({ params, results, dictionary, pathPrefix = "" }: { params: SearchParams; results: EnrichedRegistryOffice[]; dictionary: Dictionary; pathPrefix?: string }) {
  const t = (key: string) => dictionary[key] ?? key;
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{t("results.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{t("results.title")}</h1>
        <p className="mt-3 max-w-3xl text-soft-ink">{t("results.intro")}</p>
      </section>
      <section className="rounded-xl border border-linen bg-white p-4 shadow-soft sm:p-5">
        <NameSearch dictionary={dictionary} defaultValue={params.name} compact pathPrefix={pathPrefix} hiddenParams={params} />
      </section>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <SearchFilters params={params} dictionary={dictionary} pathPrefix={pathPrefix} />
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-ink">{results.length} {t("results.results")}</h2>
            <Link href={pathPrefix || "/"} className="text-sm font-semibold text-sage">{t("results.changeSearch")}</Link>
          </div>
          <div className="mt-4 grid gap-4">
            {results.map((office) => (
              <RegistryOfficeCard key={office.slug} office={office} dictionary={dictionary} pathPrefix={pathPrefix} />
            ))}
          </div>
          {results.length === 0 ? (
            <div className="mt-4 rounded-xl border border-linen bg-white p-6 text-soft-ink">
              <p className="font-semibold text-ink">{t("nameSearch.noResults")}</p>
              <p className="mt-1">{t("nameSearch.noResultsHelp")}</p>
            </div>
          ) : null}
          {results.length > 0 ? <SearchLeadCapture params={params} /> : null}
        </section>
      </div>
    </main>
  );
}
