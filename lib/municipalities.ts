import { swissRegistryOffices } from "@/lib/registry-data";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const municipalityPages = swissRegistryOffices.flatMap((office) =>
  office.responsibleMunicipalities.map((municipality) => ({
    name: municipality,
    slug: slugify(`${municipality}-${office.canton}`),
    canton: office.canton,
    cantonName: office.cantonName,
    officeSlug: office.slug
  }))
);

export function getMunicipalityPage(slug: string) {
  return municipalityPages.find((page) => page.slug === slug);
}
