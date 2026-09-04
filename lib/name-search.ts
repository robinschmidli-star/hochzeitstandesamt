import { publicCeremonyVenues } from "@/lib/public-venues";
import { swissRegistryOffices } from "@/lib/registry-data";
import { ceremonyVenuePath } from "@/lib/public-venues";

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

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    let diagonal = row[0];
    row[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      const previous = row[rightIndex];
      row[rightIndex] = Math.min(
        row[rightIndex] + 1,
        row[rightIndex - 1] + 1,
        diagonal + Number(left[leftIndex - 1] !== right[rightIndex - 1])
      );
      diagonal = previous;
    }
  }
  return row[right.length];
}

export function nameMatchRank(name: string, query: string, alternatives: string[] = [], context: string[] = []) {
  const needle = normalizeNameSearch(query);
  if (!needle) return null;
  const normalizedName = normalizeNameSearch(name);
  if (normalizedName === needle) return 0;
  if (normalizedName.startsWith(needle)) return 2;
  if (normalizedName.includes(needle)) return 3;
  const normalizedAlternatives = alternatives.map(normalizeNameSearch);
  if (normalizedAlternatives.some((value) => value === needle || value.startsWith(needle) || value.includes(needle))) return 4;
  if (context.some((value) => normalizeNameSearch(value).includes(needle))) return /^\d/.test(needle) ? 6 : 5;
  if (needle.length >= 6 && editDistance(normalizedName, needle) <= Math.max(2, Math.floor(needle.length * 0.12))) return 7;
  return null;
}

export function buildNameSearchSuggestions(): NameSearchSuggestion[] {
  const officesById = new Map(
    swissRegistryOffices.flatMap((office) => [
      ...(office.canonicalId ? [[office.canonicalId, office] as const] : []),
      [office.id, office] as const,
      [office.slug, office] as const
    ])
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
      href: ceremonyVenuePath(venue),
      searchText: [name, venue.ort, venue.adresse, venue.standesamt_name].join(" ")
    });
  }

  return suggestions;
}
