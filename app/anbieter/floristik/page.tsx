import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { unicoProvider } from "@/lib/vendor-preview";

export const metadata = createMetadata({
  title: "Floristik Anbieter | Hochzeitsfloristik Schweiz",
  description: "Floristik-Anbieter für Hochzeiten in der Schweiz. Aktuell als Vorschau mit UNICO Florales & Design GmbH.",
  path: "/anbieter/floristik"
});

export default function FloristryVendorPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-linen bg-white p-6 shadow-soft lg:p-8">
        <span className="inline-flex rounded-full border border-linen bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-soft-ink">
          Anbieter-Kategorie
        </span>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Floristik</h1>
        <p className="mt-3 max-w-3xl leading-7 text-soft-ink">
          Hochzeitsfloristik, Brautsträusse und florale Dekorationen für zivile Trauungen und Hochzeitsfeiern.
        </p>
      </section>

      <article className="rounded-xl border border-linen bg-white p-5 shadow-soft">
        <div className="mb-5 overflow-hidden rounded-xl bg-paper">
          <img src={unicoProvider.images[0].src} alt={unicoProvider.images[0].alt} className="h-56 w-full object-cover" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Floristik / Hochzeitsfloristik</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">{unicoProvider.name}</h2>
        <p className="mt-2 text-sm text-soft-ink">{unicoProvider.address}</p>
        <p className="mt-4 max-w-3xl leading-7 text-soft-ink">{unicoProvider.description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/anbieter/floristik/unico-florales-design" className="focus-ring rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white">
            Profil ansehen
          </Link>
        </div>
      </article>
    </main>
  );
}
