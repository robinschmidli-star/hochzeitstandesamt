import de from "@/locales/de.json";
import languageConfig from "@/config/languages.json";

export type Locale = keyof typeof languageConfig.languages;
export type Dictionary = Record<string, string>;

export const defaultLocale = languageConfig.default as Locale;
export const locales = (Object.keys(languageConfig.languages) as Locale[]).filter(
  (locale) => languageConfig.languages[locale].enabledForUsers
);
export const indexableLocales = locales.filter(
  (locale) => languageConfig.languages[locale].indexable
);

const legacyLanguageNames: Record<Locale, string> = {
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
  pl: "Polski",
  ro: "Română"
};

export const languageNames = Object.fromEntries(
  locales.map((locale) => [locale, languageConfig.languages[locale].name])
) as Record<Locale, string>;

export function isLocale(value?: string): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export async function getDictionary(locale: Locale = defaultLocale) {
  const dictionary = (await import(`@/locales/${locale}.json`)).default as Dictionary;
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
