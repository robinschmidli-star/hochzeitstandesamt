import type { MetadataRoute } from "next";
import { guides } from "@/lib/data";
import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import { municipalityPages } from "@/lib/municipalities";
import { defaultLocale, indexableLocales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";
  const paths = [
    "", "/standesamt-finden", "/heiraten-schweiz", "/anbieter-finden", "/anbieter/floristik", "/anbieter/floristik/unico-florales-design", "/ratgeber", "/kontakt", "/datenschutz", "/impressum",
    ...registryCantons.map((canton) => `/kanton/${canton.slug}`),
    ...municipalityPages.map((page) => `/standesamt/${page.slug}`),
    ...swissRegistryOffices.map((office) => `/zivilstandsamt/${office.slug}`),
    ...guides.map((guide) => `/ratgeber/${guide.slug}`)
  ];
  const canonicalPages = paths.map((path) => ({
    url: `${base}${path}`
  }));
  const localizedPaths = [
    "",
    ...swissRegistryOffices.map((office) => `/zivilstandsamt/${office.slug}`)
  ];
  const localizedPages = indexableLocales
    .filter((locale) => locale !== defaultLocale)
    .flatMap((locale) => localizedPaths.map((path) => ({ url: `${base}/${locale}${path}` })));
  return [...canonicalPages, ...localizedPages];
}
