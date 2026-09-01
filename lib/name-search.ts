import { publicCeremonyVenues } from "@/lib/public-venues";
import { swissRegistryOffices } from "@/lib/registry-data";

export type NameSearchSuggestion = {
  id: string;
  name: string;
  type: "office" | "venue";
  canton: string;
  place: string;
  href: string;
  searchText: string;
};

export const normalizeNameSearch = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function nameMatchRank(name: string, query: string, alternatives: string[] = [], context: string[] = []) {
  const needle = normalizeNameSearch(query);
  if (!needle) return null;
  const normalizedName = normalizeNameSearch(name);
  if (normalizedName === needle) return 0;
  if (normalizedName.startsWith(needle)) return 1;
  if (normalizedName.includes(needle)) return 2;
  const normalizedAlternatives = alternatives.map(normalizeNameSearch);
  if (normalizedAlternatives.some((value) => value === needle)) return 0;
  if (normalizedAlternatives.some((value) => value.startsWith(needle))) return 1;
  if (normalizedAlternatives.some((value) => value.includes(needle))) return 2;
  if (context.some((value) => normalizeNameSearch(value).includes(needle))) return 3;
  return null;
}

export function buildNameSearchSuggestions(): NameSearchSuggestion[] {
  const officesById = new Map(
    swissRegistryOffices.flatMap((office) => [[office.id, office], [office.slug, office]] as const)
  );
  const suggestions: NameSearchSuggestion[] = swissRegistryOffices.map((office) => ({
    id: `office:${office.slug}`,
    name: office.name,
    type: "office",
    canton: office.canton,
    place: office.city,
    href: `/zivilstandsamt/${office.slug}`,
    searchText: [office.name, office.city, office.postalCode, office.cantonName, ...office.responsibleMunicipalities, ...(office.ceremonyLocations ?? [])].join(" ")
  }));
  const seenVenues = new Set<string>();

  for (const venue of publicCeremonyVenues) {
    const office = officesById.get(venue.standesamt_id);
    if (!office) continue;
    const name = venue.traulokal_name;
    const key = `${normalizeNameSearch(name)}:${office.slug}`;
    if (!name || seenVenues.has(key)) continue;
    seenVenues.add(key);
    suggestions.push({
      id: `venue:${venue.canonicalId ?? key}`,
      name,
      type: "venue",
      canton: venue.kanton || office.canton,
      place: venue.ort || office.city,
      href: `/zivilstandsamt/${office.slug}#trauorte`,
      searchText: [name, venue.ort, venue.adresse, venue.standesamt_name].join(" ")
    });
  }

  return suggestions;
}
