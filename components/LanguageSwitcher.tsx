"use client";

import { usePathname } from "next/navigation";
import { languageNames, locales, type Locale, withLocalePath } from "@/lib/i18n";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  const chooseLanguage = (locale: Locale) => {
    window.localStorage.setItem("preferred-language", locale);
    document.documentElement.lang = locale;
    window.location.href = withLocalePath(pathname, locale);
  };

  return (
    <details className="group relative">
      <summary className="focus-ring flex cursor-pointer list-none items-center gap-2 rounded-full border border-linen bg-white px-3 py-2 text-sm font-semibold text-ink shadow-soft marker:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linen text-xs">文/A</span>
        <span>{languageNames[currentLocale]}</span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 max-h-[70vh] w-64 overflow-auto rounded-xl border border-linen bg-white p-2 shadow-soft">
        <div className="grid gap-1">
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => chooseLanguage(locale)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition hover:bg-linen ${
                currentLocale === locale ? "bg-linen text-ink" : "text-soft-ink"
              }`}
            >
              {languageNames[locale]}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
