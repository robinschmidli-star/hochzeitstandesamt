import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch"),
  title: {
    default: "hochzeitstandesamt.ch - Standesamt finden in der Schweiz",
    template: "%s | hochzeitstandesamt.ch"
  },
  description:
    "Finde das passende Zivilstandsamt in der Schweiz, verstehe den Ablauf der standesamtlichen Trauung und plane die naechsten Schritte."
};

const nav = [
  { href: "/standesamt-finden", label: "Standesamt finden" },
  { href: "/ratgeber", label: "Ratgeber rund ums Heiraten" },
  { href: "/anbieter-finden", label: "Anbieter finden (folgt)" },
  { href: "/kontakt", label: "Kontakt" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de-CH">
      <body className="min-h-screen font-sans antialiased">
        <header className="sticky top-0 z-40 border-b border-linen bg-paper/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-lg font-semibold tracking-[0] text-sage">
              hochzeitstandesamt.ch
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-soft-ink md:flex">
              {nav.map((item) => (
                item.href === "/anbieter-finden" ? (
                  <span key={item.href} className="cursor-not-allowed text-soft-ink/55" title="Dieser Bereich folgt später">
                    {item.label}
                  </span>
                ) : (
                  <Link key={item.href} href={item.href} className="transition hover:text-sage">
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
            <div className="hidden h-10 w-[310px] md:block" aria-hidden="true" />
          </div>
        </header>
        {children}
        <footer className="border-t border-sage/10 bg-sage text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
            <div className="md:col-span-2">
              <p className="text-lg font-semibold">hochzeitstandesamt.ch</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                Der erste Schritt zur Hochzeit in der Schweiz: Zivilstandsamt finden, Ablauf verstehen und sauber weiterplanen.
              </p>
            </div>
            <div>
              <p className="font-semibold">Plattform</p>
              <div className="mt-3 grid gap-2 text-sm text-white/70">
                {nav.map((item) => (
                  item.href === "/anbieter-finden" ? (
                    <span key={item.href} className="text-white/45">
                      {item.label}
                    </span>
                  ) : (
                    <Link key={item.href} href={item.href} className="hover:text-white">
                      {item.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold">Rechtliches</p>
              <div className="mt-3 grid gap-2 text-sm text-white/70">
                <Link href="/kontakt" className="hover:text-white">Kontakt</Link>
                <Link href="/datenschutz" className="hover:text-white">Datenschutz</Link>
                <Link href="/impressum" className="hover:text-white">Impressum</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
