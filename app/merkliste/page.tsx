import { headers } from "next/headers";
import type { Metadata } from "next";
import { ShortlistPageClient } from "@/components/ShortlistPageClient";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Merkliste", robots: { index: false, follow: true } };

export default async function ShortlistPage() {
  const rawLocale = (await headers()).get("x-site-locale") ?? defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  return <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:px-8"><ShortlistPageClient locale={locale} /></main>;
}
