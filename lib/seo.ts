import type { Metadata } from "next";
import type { CeremonyVenue, SwissRegistryOffice } from "@/lib/types";
import { defaultLocale, hreflangForLocale, indexableLocales, type Dictionary, type Locale } from "@/lib/i18n";
import { hasActiveSearch, parseSearchParams, type RawSearchParams } from "@/lib/discovery";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";

export function discoveryMetadata(dictionary: Dictionary, locale: Locale, rawParams: RawSearchParams): Metadata {
  const path = locale === defaultLocale ? "" : `/${locale}`;
  const params = parseSearchParams(rawParams);
  const filtered = hasActiveSearch(params) || Boolean(params.page);
  return {
    ...createMetadata({ title: dictionary["hero.title"], description: dictionary["hero.subtitle"], path, locale: hreflangForLocale(locale).replace("-", "_") }),
    alternates: {
      canonical: `${siteUrl}${path}`,
      languages: {
        ...Object.fromEntries(indexableLocales.map((item) => [hreflangForLocale(item), `${siteUrl}${item === defaultLocale ? "" : `/${item}`}`])),
        "x-default": siteUrl
      }
    },
    robots: filtered || !indexableLocales.includes(locale) ? { index: false, follow: true } : { index: true, follow: true }
  };
}

export function createMetadata(input: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  locale?: string;
}): Metadata {
  const url = `${siteUrl}${input.path ?? ""}`;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: "hochzeitstandesamt.ch",
      locale: input.locale ?? "de_CH",
      type: input.type ?? "website"
    }
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function faqSchema(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function registryOfficeSchema(
  office: SwissRegistryOffice,
  venues: CeremonyVenue[]
) {
  const url = `${siteUrl}/zivilstandsamt/${office.slug}`;
  const address = [office.addressLine1, `${office.postalCode} ${office.city}`]
    .filter(Boolean)
    .join(", ");

  return {
    "@context": "https://schema.org",
    "@type": "GovernmentOffice",
    "@id": `${url}#office`,
    url,
    name: office.name,
    ...(office.canonicalId ? { identifier: office.canonicalId } : {}),
    ...(office.phone ? { telephone: office.phone } : {}),
    ...(office.email ? { email: office.email } : {}),
    ...(office.officialUrl ? { sameAs: office.officialUrl } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: office.addressLine1 || undefined,
      postalCode: office.postalCode || undefined,
      addressLocality: office.city || undefined,
      addressRegion: office.canton,
      addressCountry: "CH"
    },
    areaServed: office.responsibleMunicipalities.map((name) => ({
      "@type": "AdministrativeArea",
      name
    })),
    ...(address ? { description: `${office.name}, ${address}` } : {}),
    ...(venues.length
      ? {
          containsPlace: venues.map((venue) => ({
            "@type": "Place",
            name: venue.traulokal_name,
            ...(venue.canonicalId ? { identifier: venue.canonicalId } : {}),
            ...(venue.beschreibung ? { description: venue.beschreibung } : {}),
            ...(venue.venueUrl ? { url: venue.venueUrl } : {}),
            address: {
              "@type": "PostalAddress",
              streetAddress: venue.adresse || undefined,
              addressLocality: venue.ort || undefined,
              addressRegion: venue.kanton,
              addressCountry: "CH"
            }
          }))
        }
      : {})
  };
}
