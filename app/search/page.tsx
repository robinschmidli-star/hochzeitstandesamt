import { SearchResultsPage } from "@/components/SearchResultsExperience";
import { createMetadata } from "@/lib/seo";
import { searchExperienceOffices, type SearchParams } from "@/lib/search-experience";

export const metadata = createMetadata({
  title: "Standesamt-Suche Schweiz | Datum, Region & Inspiration",
  description: "Finde Standesämter in der Schweiz nach Datum, Region, Samstagstrauung oder Stil.",
  path: "/search"
});

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
  const params: SearchParams = {
    location: getParam(rawParams, "location"),
    radius: getParam(rawParams, "radius"),
    canton: getParam(rawParams, "canton"),
    month: getParam(rawParams, "month"),
    year: getParam(rawParams, "year"),
    date: getParam(rawParams, "date"),
    weekday: getParam(rawParams, "weekday"),
    tag: getParam(rawParams, "tag"),
    saturdayOnly: getParam(rawParams, "saturdayOnly"),
    wheelchair: getParam(rawParams, "wheelchair"),
    parking: getParam(rawParams, "parking"),
    evening: getParam(rawParams, "evening"),
    outdoor: getParam(rawParams, "outdoor"),
    onlineBooking: getParam(rawParams, "onlineBooking"),
    multipleVenues: getParam(rawParams, "multipleVenues"),
    maxGuests: getParam(rawParams, "maxGuests")
  };
  const results = searchExperienceOffices(params);

  return <SearchResultsPage params={params} results={results} />;
}
