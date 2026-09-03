import Link from "next/link";
import { SearchResults } from "@/components/SearchResultsExperience";
import { HomeHeroSearchClient } from "@/components/HomeHeroSearchClient";
import { SwissMap } from "@/components/SwissMap";
import type { SearchParams } from "@/lib/search-experience";
import { discoveryHref, hasActiveSearch, parseSearchParams, type RawSearchParams } from "@/lib/discovery";
import { defaultLocale, type Dictionary, type Locale } from "@/lib/i18n";
import { registrySearchLabels } from "@/lib/registry-search-labels";
import de from "@/locales/de.json";

function createTranslator(dictionary: Dictionary) {
  const fallback = de as Dictionary;
  return (key: string) => dictionary[key] ?? fallback[key] ?? key;
}

export function HomeHeroSearch({ dictionary, pathPrefix = "", params }: { dictionary: Dictionary; pathPrefix?: string; params: SearchParams }) {
  const t = createTranslator(dictionary);

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-champagne">{t("hero.eyebrow")}</p>
        <h1 className="mt-3 max-w-5xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">{t("hero.title")}</h1>
        <p className="mt-3 max-w-3xl text-base leading-6 text-soft-ink sm:mt-5 sm:text-lg sm:leading-8">{t("hero.subtitle")}</p>
        <HomeHeroSearchClient dictionary={dictionary} pathPrefix={pathPrefix} params={params} />
      </div>
    </section>
  );
}

export function PopularSearchLinks({ dictionary, pathPrefix = "", params }: { dictionary: Dictionary; pathPrefix?: string; params: SearchParams }) {
  const t = createTranslator(dictionary);
  const links: [SearchParams, string][] = [
    [{ tag: "featured" }, t("popular.featured")],
    [{ tag: "lake" }, t("popular.lake")],
    [{ tag: "castle" }, t("popular.castle")],
    [{ tag: "historic" }, t("tag.historic")],
    [{ tag: "nature" }, t("tag.nature")],
    [{ elopement: "true" }, t("results.elopement")],
    [{ saturdayOnly: "true" }, t("guides.saturday")]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 pt-0 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-ink">{t("popular.title")}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(([filters, label]) => (
          <Link key={label} href={discoveryHref(params, { ...filters, submitted: "1" }, pathPrefix)} className="focus-ring rounded-xl border border-linen bg-white p-4 font-semibold text-ink shadow-soft transition hover:border-champagne hover:text-sage">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SwitzerlandMapSection({
  dictionary,
  locale = defaultLocale,
  params
}: {
  dictionary: Dictionary;
  locale?: Locale;
  params: SearchParams;
}) {
  return (
    <section id="canton-map" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-8 pt-2 sm:px-6 lg:px-8">
      <SwissMap labels={registrySearchLabels(dictionary, locale)} searchPath="/" selectedCanton={params.canton} searchQuery={discoveryHref(params).split("?")[1]?.split("#")[0]} />
    </section>
  );
}

export function HomeGuideTeasers({ dictionary, pathPrefix = "" }: { dictionary: Dictionary; pathPrefix?: string }) {
  const t = createTranslator(dictionary);
  const guides = [
    [t("homeSearch.guideProcess"), "/ratgeber/heiraten-schweiz-ablauf"],
    [t("homeSearch.guideDocuments"), "/ratgeber/dokumente-standesamtliche-hochzeit"],
    [t("guides.reserve"), "/ratgeber/heiraten-schweiz-offizielle-informationen"],
    [t("guides.cost"), "/ratgeber/heiraten-schweiz-offizielle-informationen"]
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-ink">{t("guides.journeyTitle")}</h2>
      <p className="mt-3 max-w-2xl text-soft-ink">{t("guides.journeyDescription")}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {guides.map(([label, href]) => (
          <Link key={label} href={href} hrefLang="de" className="focus-ring rounded-xl border border-linen bg-white p-4 font-semibold text-ink hover:text-sage">{label}</Link>
        ))}
      </div>
      {pathPrefix ? <p className="mt-2 text-xs text-soft-ink">{t("guides.germanOnly")}</p> : null}
      <div className="mt-4 flex flex-wrap gap-4">
        <Link href={`${pathPrefix}/ratgeber`} className="focus-ring inline-flex min-h-11 items-center font-semibold text-sage">{t("homeSearch.allGuides")} →</Link>
        <Link href="/heiraten-schweiz" hrefLang="de" className="focus-ring inline-flex min-h-11 items-center text-sm text-sage">{t("guides.journeyAction")}</Link>
      </div>
    </section>
  );
}

export function HomeSearchPage({ dictionary, rawParams, locale = defaultLocale }: { dictionary: Dictionary; rawParams: RawSearchParams; locale?: Locale }) {
  const params = parseSearchParams(rawParams);
  const pathPrefix = locale === defaultLocale ? "" : `/${locale}`;
  return (
    <main>
      <HomeHeroSearch dictionary={dictionary} pathPrefix={pathPrefix} params={params} />
      <SearchResults params={params} dictionary={dictionary} pathPrefix={pathPrefix} initial={!hasActiveSearch(params)} />
      <PopularSearchLinks dictionary={dictionary} pathPrefix={pathPrefix} params={params} />
      <SwitzerlandMapSection dictionary={dictionary} locale={locale} params={params} />
      <HomeGuideTeasers dictionary={dictionary} pathPrefix={pathPrefix} />
    </main>
  );
}
