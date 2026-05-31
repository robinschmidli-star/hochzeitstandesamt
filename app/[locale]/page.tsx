import type { Metadata } from "next";
import {
  FeaturedRegistryOffices,
  HomeGuideTeasers,
  HomeHeroSearch,
  PopularSearchLinks,
  SwitzerlandMapSection
} from "@/components/HomeSearchExperience";
import { defaultLocale, getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";

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
      canonical: `${baseUrl}/${locale}`,
      languages: {
        ...Object.fromEntries(locales.map((item) => [item, `${baseUrl}/${item}`])),
        "x-default": `${baseUrl}/${defaultLocale}`
      }
    }
  };
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = await getDictionary(locale);

  return (
    <>
      <HomeHeroSearch dictionary={dictionary} />
      <PopularSearchLinks dictionary={dictionary} />
      <SwitzerlandMapSection />
      <FeaturedRegistryOffices dictionary={dictionary} />
      <HomeGuideTeasers dictionary={dictionary} />
    </>
  );
}
