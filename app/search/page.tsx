// Compatibility entry point: the same discovery page, canonicalized to the homepage.
import { headers } from "next/headers";
import { HomeSearchPage } from "@/components/HomeSearchExperience";
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n";
import type { RawSearchParams } from "@/lib/discovery";
import { discoveryMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<RawSearchParams> };

async function requestLocale() {
  const requested = (await headers()).get("x-site-locale");
  return isLocale(requested ?? undefined) ? requested! : defaultLocale;
}

export async function generateMetadata({ searchParams }: Props) {
  const requested = await requestLocale();
  const locale = isLocale(requested) ? requested : defaultLocale;
  return discoveryMetadata(await getDictionary(locale), locale, await searchParams);
}

export default async function SearchPage({ searchParams }: Props) {
  const requested = await requestLocale();
  const locale = isLocale(requested) ? requested : defaultLocale;
  const rawParams = await searchParams;
  return <HomeSearchPage dictionary={await getDictionary(locale)} rawParams={rawParams} locale={locale} />;
}
