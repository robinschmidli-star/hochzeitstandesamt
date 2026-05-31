import de from "@/locales/de.json";

export const locales = ["de", "en", "fr", "it", "es", "pt", "nl", "sr", "sq", "tr", "hr", "bs", "uk", "pl"] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = Record<string, string>;

export const defaultLocale: Locale = "de";

const dictionaries = {
  de: () => import("@/locales/de.json").then((module) => module.default),
  en: () => import("@/locales/en.json").then((module) => module.default),
  fr: () => import("@/locales/fr.json").then((module) => module.default),
  it: () => import("@/locales/it.json").then((module) => module.default),
  es: () => import("@/locales/es.json").then((module) => module.default),
  pt: () => import("@/locales/pt.json").then((module) => module.default),
  nl: () => import("@/locales/nl.json").then((module) => module.default),
  sr: () => import("@/locales/sr.json").then((module) => module.default),
  sq: () => import("@/locales/sq.json").then((module) => module.default),
  tr: () => import("@/locales/tr.json").then((module) => module.default),
  hr: () => import("@/locales/hr.json").then((module) => module.default),
  bs: () => import("@/locales/bs.json").then((module) => module.default),
  uk: () => import("@/locales/uk.json").then((module) => module.default),
  pl: () => import("@/locales/pl.json").then((module) => module.default)
} satisfies Record<Locale, () => Promise<Dictionary>>;

export const languageNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  pt: "Português",
  nl: "Nederlands",
  sr: "Srpski",
  sq: "Shqip",
  tr: "Türkçe",
  hr: "Hrvatski",
  bs: "Bosanski",
  uk: "Українська",
  pl: "Polski"
};

export function isLocale(value?: string): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export async function getDictionary(locale: Locale = defaultLocale) {
  const dictionary = await dictionaries[locale]();
  const fallback = de as Dictionary;

  return {
    ...fallback,
    ...dictionary
  };
}

export function withLocalePath(path: string, locale: Locale) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const parts = cleanPath.split("/").filter(Boolean);
  const withoutLocale = isLocale(parts[0]) ? parts.slice(1) : parts;

  return `/${[locale, ...withoutLocale].join("/")}`;
}
