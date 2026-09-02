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

  if (locale === defaultLocale) {
    return withoutLocale.length ? `/${withoutLocale.join("/")}` : "/";
  }
  return `/${[locale, ...withoutLocale].join("/")}`;
}

export function isLocalizedContentPath(path: string) {
  const pathname = path.split(/[?#]/, 1)[0] || "/";
  const parts = pathname.split("/").filter(Boolean);
  const withoutLocale = isLocale(parts[0]) ? parts.slice(1) : parts;
  const normalized = withoutLocale.length ? `/${withoutLocale.join("/")}` : "/";

  return (
    normalized === "/" ||
    normalized === "/search" ||
    normalized === "/standesamt-finden" ||
    normalized === "/ratgeber" ||
    normalized.startsWith("/trauort/") ||
    normalized.startsWith("/zivilstandsamt/")
  );
}

export function withAvailableLocalePath(path: string, locale: Locale) {
  return locale === defaultLocale || isLocalizedContentPath(path)
    ? withLocalePath(path, locale)
    : withLocalePath(path, defaultLocale);
}

export function languageSwitchPath(path: string, locale: Locale) {
  if (locale === defaultLocale || isLocalizedContentPath(path)) {
    return withLocalePath(path, locale);
  }
  const pathname = path.split(/[?#]/, 1)[0] || "/";
  const parts = pathname.split("/").filter(Boolean);
  const withoutLocale = isLocale(parts[0]) ? parts.slice(1) : parts;
  const fallback = withoutLocale[0] === "ratgeber" ? "/ratgeber" : "/";
  return withLocalePath(fallback, locale);
}
