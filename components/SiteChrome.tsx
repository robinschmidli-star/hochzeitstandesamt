"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import de from "@/locales/de.json";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import it from "@/locales/it.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";
import nl from "@/locales/nl.json";
import sr from "@/locales/sr.json";
import sq from "@/locales/sq.json";
import tr from "@/locales/tr.json";
import hr from "@/locales/hr.json";
import bs from "@/locales/bs.json";
import uk from "@/locales/uk.json";
import pl from "@/locales/pl.json";
import { defaultLocale, isLocale, type Dictionary, type Locale, withLocalePath } from "@/lib/i18n";

const dictionaries: Record<Locale, Dictionary> = { de, en, fr, it, es, pt, nl, sr, sq, tr, hr, bs, uk, pl };

function getLocaleFromPath(pathname: string): Locale {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locale = getLocaleFromPath(pathname);
  const fallback = de as Dictionary;
  const dictionary = { ...fallback, ...dictionaries[locale] };
  const t = (key: string) => dictionary[key] ?? fallback[key] ?? key;
  const nav = [
    { href: "/", label: t("nav.home") },
    { href: "/standesamt-finden", label: t("nav.registries") },
    { href: "/ratgeber", label: t("nav.guides") },
    { href: "/anbieter-finden", label: t("nav.venues"), disabled: true },
    { href: "/kontakt", label: t("nav.contact") }
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    const savedLocale = window.localStorage.getItem("preferred-language");

    const storedLocale = isLocale(savedLocale ?? undefined) ? savedLocale as Locale : null;

    if (!isLocale(firstSegment) && storedLocale && storedLocale !== defaultLocale) {
      window.location.href = withLocalePath(pathname, storedLocale);
      return;
    }

    window.localStorage.setItem("preferred-language", locale);
    document.documentElement.lang = locale;
  }, [locale, pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-linen bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href={withLocalePath("/", locale)} className="text-lg font-semibold tracking-[0] text-sage">
            hochzeitstandesamt.ch
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-soft-ink md:flex">
            {nav.slice(1).map((item) => (
              <Link
                key={item.href}
                href={withLocalePath(item.href, locale)}
                className={item.disabled ? "text-soft-ink/55 transition hover:text-soft-ink" : "transition hover:text-sage"}
                title={item.disabled ? t("nav.venues") : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-linen bg-white text-sage shadow-soft md:hidden"
              aria-label={mobileMenuOpen ? "Menü schliessen" : "Menü öffnen"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span className="sr-only">{mobileMenuOpen ? "Menü schliessen" : "Menü öffnen"}</span>
              <span className="grid gap-1">
                <span className={`block h-0.5 w-4 rounded-full bg-current transition ${mobileMenuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`block h-0.5 w-4 rounded-full bg-current transition ${mobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-4 rounded-full bg-current transition ${mobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </span>
            </button>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
        {mobileMenuOpen ? (
          <nav className="border-t border-linen bg-paper px-4 py-3 shadow-soft md:hidden">
            <div className="mx-auto grid max-w-7xl gap-2 text-sm text-soft-ink">
              {nav.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={withLocalePath(item.href, locale)}
                  className={
                    item.disabled
                      ? "rounded-xl px-3 py-3 text-soft-ink/55"
                      : "rounded-xl px-3 py-3 transition hover:bg-white hover:text-sage"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </header>
      {children}
      <footer className="border-t border-sage/10 bg-sage text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="md:col-span-2">
            <p className="text-lg font-semibold">hochzeitstandesamt.ch</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">{t("footer.about")}</p>
          </div>
          <div>
            <p className="font-semibold">{t("footer.platform")}</p>
            <div className="mt-3 grid gap-2 text-sm text-white/70">
              {nav.slice(1).map((item) => (
                <Link key={item.href} href={withLocalePath(item.href, locale)} className={item.disabled ? "text-white/45 hover:text-white/70" : "hover:text-white"}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold">{t("footer.legal")}</p>
            <div className="mt-3 grid gap-2 text-sm text-white/70">
              <Link href={withLocalePath("/kontakt", locale)} className="hover:text-white">{t("nav.contact")}</Link>
              <Link href={withLocalePath("/datenschutz", locale)} className="hover:text-white">{t("footer.privacy")}</Link>
              <Link href={withLocalePath("/impressum", locale)} className="hover:text-white">{t("footer.imprint")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
