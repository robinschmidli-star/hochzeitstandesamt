import type { MetadataRoute } from "next";
import { guides } from "@/lib/data";
import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import { municipalityPages } from "@/lib/municipalities";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";
  return [
    "", "/standesamt-finden", "/ratgeber", "/kontakt", "/datenschutz", "/impressum",
    ...registryCantons.map((canton) => `/kanton/${canton.slug}`),
    ...municipalityPages.map((page) => `/standesamt/${page.slug}`),
    ...swissRegistryOffices.map((office) => `/zivilstandsamt/${office.slug}`),
    ...guides.map((guide) => `/ratgeber/${guide.slug}`)
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date()
  }));
}
