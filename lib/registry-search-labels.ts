import type { Dictionary, Locale } from "@/lib/i18n";
import de from "@/locales/de.json";

export type RegistrySearchLabels = ReturnType<typeof registrySearchLabels>;

export function registrySearchLabels(dictionary: Dictionary, locale: Locale) {
  const value = (key: string) => dictionary[key];
  return {
    locale,
    title: value("registry.title"),
    intro: value("registry.intro"),
    city: value("registry.city"),
    cityPlaceholder: value("registry.cityPlaceholder"),
    period: value("registry.period"),
    from: value("registry.from"),
    until: value("registry.until"),
    submit: value("registry.submit"),
    filters: value("registry.filters"),
    canton: value("registry.canton"),
    allCantons: value("registry.allCantons"),
    weekdays: value("registry.weekdays"),
    weekdayNames: value("registry.weekdayNames").split("|"),
    mapEyebrow: value("registry.mapEyebrow"),
    mapSelect: value("registry.mapSelect"),
    mapSelected: value("registry.mapSelected"),
    mapIntro: value("registry.mapIntro"),
    mapSelectedIntro: value("registry.mapSelectedIntro"),
    back: value("registry.back"),
    offices: value("registry.offices"),
    mapAria: value("registry.mapAria"),
    mapSource: value("registry.mapSource"),
    results: value("registry.results"),
    sorted: value("registry.sorted"),
    noResults: value("registry.noResults"),
    noResultsHint: value("registry.noResultsHint"),
    address: value("registry.address"),
    contact: value("registry.contact"),
    noPhone: value("registry.noPhone"),
    municipalities: value("registry.municipalities"),
    details: value("registry.details"),
    email: value("registry.email")
  };
}

export const defaultRegistrySearchLabels = registrySearchLabels(de, "de");
