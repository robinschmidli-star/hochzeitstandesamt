import {
  FeaturedRegistryOffices,
  HomeGuideTeasers,
  HomeHeroSearch,
  PopularSearchLinks,
  SwitzerlandMapSection
} from "@/components/HomeSearchExperience";
import { defaultLocale, getDictionary } from "@/lib/i18n";

export default async function HomePage() {
  const dictionary = await getDictionary(defaultLocale);

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
