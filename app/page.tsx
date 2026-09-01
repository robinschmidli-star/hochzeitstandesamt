import { HomeSearchPage } from "@/components/HomeSearchExperience";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import type { RawSearchParams } from "@/lib/discovery";
import { discoveryMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: Props) {
  return discoveryMetadata(await getDictionary(defaultLocale), defaultLocale, await searchParams);
}

export default async function HomePage({ searchParams }: Props) {
  return <HomeSearchPage dictionary={await getDictionary(defaultLocale)} rawParams={await searchParams} />;
}
