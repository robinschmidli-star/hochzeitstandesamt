import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Analytics } from "@/components/Analytics";
import { SiteChrome } from "@/components/SiteChrome";
import { defaultLocale, hreflangForLocale, indexableLocales, isLocale } from "@/lib/i18n";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "hochzeitstandesamt.ch - Standesamt finden in der Schweiz",
    template: "%s | hochzeitstandesamt.ch"
  },
  description:
    "Finde das passende Zivilstandsamt in der Schweiz, verstehe den Ablauf der standesamtlichen Trauung und plane die naechsten Schritte.",
  alternates: {
    canonical: siteUrl,
    languages: {
      ...Object.fromEntries(indexableLocales.map((locale) => [
        hreflangForLocale(locale),
        locale === "de" ? siteUrl : `${siteUrl}/${locale}`
      ])),
      "x-default": siteUrl
    }
  }
};

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale?: string }> }>) {
  const routeParams = await params;
  const requestedLocale = (await headers()).get("x-site-locale") ?? routeParams.locale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  return (
    <html lang={hreflangForLocale(locale)} data-scroll-behavior="smooth">
      <body className="min-h-screen font-sans antialiased">
        <Suspense><Analytics /></Suspense>
        <SiteChrome initialLocale={locale}>{children}</SiteChrome>
      </body>
    </html>
  );
}
