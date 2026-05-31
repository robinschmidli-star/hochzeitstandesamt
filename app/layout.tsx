import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { defaultLocale, locales } from "@/lib/i18n";
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
    canonical: `${siteUrl}/${defaultLocale}`,
    languages: {
      ...Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}/${locale}`])),
      "x-default": `${siteUrl}/${defaultLocale}`
    }
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de-CH">
      <body className="min-h-screen font-sans antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
