import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { vendorCategories } from "@/lib/vendor-preview";

export const metadata = createMetadata({
  title: "Anbieter finden | Hochzeitsanbieter Schweiz",
  description: "Vorschau auf kommende Hochzeitsanbieter-Kategorien von Floristik bis Recht und Ehevertrag.",
  path: "/anbieter-finden"
});

export default function VendorPreviewPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-linen bg-white p-6 shadow-soft lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-linen bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-soft-ink">
              folgt bald
            </span>
            <h1 className="mt-4 text-4xl font-semibold text-ink">Anbieter finden</h1>
            <p className="mt-3 max-w-3xl leading-7 text-soft-ink">
              Bald findest du hier passende Hochzeitsanbieter in deiner Region - von Floristik über Fotografen bis zu DJs und Wedding Plannern.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vendorCategories.map((category) => {
            const isFloristry = category === "Floristik";
            const cardClass =
              "rounded-xl border border-linen p-4 text-left font-semibold transition " +
              (isFloristry
                ? "bg-white text-sage hover:border-champagne"
                : "cursor-not-allowed bg-paper/70 text-soft-ink/45 opacity-70");

            return isFloristry ? (
              <Link key={category} href="/anbieter/floristik" className={`focus-ring ${cardClass}`}>
                <span>{category}</span>
                <span className="mt-2 block text-xs font-medium text-soft-ink">bereits verfügbar</span>
              </Link>
            ) : (
              <div key={category} className={cardClass} aria-disabled="true">
                <span>{category}</span>
                <span className="mt-2 block text-xs font-medium text-soft-ink/50">folgt bald</span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
