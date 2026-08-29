import {
  FeaturedVenueResultsPage,
  SearchResultsPage
} from "@/components/SearchResultsExperience";
import { createMetadata } from "@/lib/seo";
import {
  featuredCeremonyVenues,
  searchExperienceOffices,
  type SearchParams
} from "@/lib/search-experience";
import { headers } from "next/headers";
import { defaultLocale, getDictionary, hreflangForLocale, indexableLocales, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = await getDictionary(locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";
  const path = locale === defaultLocale ? "/search" : `/${locale}/search`;
  return {
    ...createMetadata({ title: dictionary["results.title"], description: dictionary["results.intro"], path }),
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        ...Object.fromEntries(indexableLocales.map((item) => [hreflangForLocale(item), item === defaultLocale ? `${baseUrl}/search` : `${baseUrl}/${item}/search`])),
        "x-default": `${baseUrl}/search`
      }
    },
    ...(Object.keys(params).length ? { robots: { index: false, follow: true } } : {})
  };
}

function getParam(params: Record<string, string | string[] | undefined>, key: keyof SearchParams) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const rawLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = await getDictionary(locale);
  const pathPrefix = locale === defaultLocale ? "" : `/${locale}`;
  const params: SearchParams = {
    name: getParam(rawParams, "name"),
    location: getParam(rawParams, "location"),
    radius: getParam(rawParams, "radius"),
    canton: getParam(rawParams, "canton"),
    month: getParam(rawParams, "month"),
    year: getParam(rawParams, "year"),
    date: getParam(rawParams, "date"),
    weekday: getParam(rawParams, "weekday"),
    tag: getParam(rawParams, "tag"),
    saturdayOnly: getParam(rawParams, "saturdayOnly"),
    elopement: getParam(rawParams, "elopement"),
    wheelchair: getParam(rawParams, "wheelchair"),
    parking: getParam(rawParams, "parking"),
    evening: getParam(rawParams, "evening"),
    outdoor: getParam(rawParams, "outdoor"),
    onlineBooking: getParam(rawParams, "onlineBooking"),
    multipleVenues: getParam(rawParams, "multipleVenues"),
    maxGuests: getParam(rawParams, "maxGuests")
  };
  if (params.tag === "featured") {
    return <FeaturedVenueResultsPage params={params} venues={featuredCeremonyVenues(params)} dictionary={dictionary} pathPrefix={pathPrefix} />;
  }
  const results = searchExperienceOffices(params);

  return <SearchResultsPage params={params} results={results} dictionary={dictionary} pathPrefix={pathPrefix} />;
}
