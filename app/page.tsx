import {
  FeaturedRegistryOffices,
  HomeGuideTeasers,
  HomeHeroSearch,
  PopularSearchLinks,
  SwitzerlandMapSection
} from "@/components/HomeSearchExperience";

export default function HomePage() {
  return (
    <>
      <HomeHeroSearch />
      <PopularSearchLinks />
      <SwitzerlandMapSection />
      <FeaturedRegistryOffices />
      <HomeGuideTeasers />
    </>
  );
}
