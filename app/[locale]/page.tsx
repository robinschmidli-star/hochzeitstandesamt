import { HomeSearchPage } from "@/components/HomeSearchExperience";
import { defaultLocale, getDictionary, isLocale, locales } from "@/lib/i18n";
import type { RawSearchParams } from "@/lib/discovery";
import { discoveryMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<RawSearchParams> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  return discoveryMetadata(await getDictionary(locale), locale, await searchParams);
}

export default async function LocalizedHomePage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  return <HomeSearchPage dictionary={await getDictionary(locale)} rawParams={await searchParams} locale={locale} />;
}
