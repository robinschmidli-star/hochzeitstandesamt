import type { Metadata } from "next";
import {
  FeaturedRegistryOffices,
  HomeGuideTeasers,
  HomeHeroSearch,
  PopularSearchLinks,
  SwitzerlandMapSection
} from "@/components/HomeSearchExperience";
import { defaultLocale, getDictionary, hreflangForLocale, indexableLocales, isLocale, locales, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = await getDictionary(locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";

  return {
    title: dictionary["hero.title"],
    description: dictionary["hero.subtitle"],
    alternates: {
      canonical: locale === defaultLocale ? baseUrl : `${baseUrl}/${locale}`,
      languages: {
        ...Object.fromEntries(indexableLocales.map((item) => [
          hreflangForLocale(item),
          item === defaultLocale ? baseUrl : `${baseUrl}/${item}`
        ])),
        "x-default": baseUrl
      }
    },
    robots: indexableLocales.includes(locale) ? undefined : { index: false, follow: true }
  };
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = await getDictionary(locale);
  const pathPrefix = locale === defaultLocale ? "" : `/${locale}`;

  return (
    <>
      <HomeHeroSearch dictionary={dictionary} pathPrefix={pathPrefix} />
      <PopularSearchLinks dictionary={dictionary} pathPrefix={pathPrefix} />
      <SwitzerlandMapSection dictionary={dictionary} locale={locale} />
      <FeaturedRegistryOffices dictionary={dictionary} pathPrefix={pathPrefix} />
      <HomeGuideTeasers dictionary={dictionary} pathPrefix={pathPrefix} />
    </>
  );
}
