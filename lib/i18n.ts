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

const localeHreflangs: Partial<Record<Locale, string>> = {
  de: "de-CH",
  fr: "fr-CH",
  it: "it-CH",
  en: "en"
};

export function hreflangForLocale(locale: Locale) {
  return localeHreflangs[locale] ?? locale;
}

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
