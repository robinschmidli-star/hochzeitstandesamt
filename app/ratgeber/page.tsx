import Link from "next/link";
import { guides } from "@/lib/data";
import { createMetadata } from "@/lib/seo";
import type { GuideArticle } from "@/lib/types";

export const metadata = createMetadata({
  title: "Ratgeber zur standesamtlichen Hochzeit",
  description: "Praktische Informationen zu Ablauf, Dokumenten und Planung der Ziviltrauung in der Schweiz.",
  path: "/ratgeber"
});

const guideSections = [
  {
    title: "Start & Ablauf",
    description: "Die wichtigsten Grundlagen, bevor ihr beim Zivilstandsamt startet.",
    slugs: ["heiraten-schweiz-offizielle-informationen", "heiraten-schweiz-ablauf"]
  },
  {
    title: "Dokumente & offizielle Merkblätter",
    description: "Unterlagen, Merkblätter und offizielle Hinweise für die Vorbereitung.",
    slugs: ["dokumente-standesamtliche-hochzeit", "offizielle-merkblaetter-bundesamt-justiz"]
  },
  {
    title: "Recht & finanzielle Folgen",
    description: "Themen, bei denen eine frühzeitige rechtliche Einordnung sinnvoll sein kann.",
    slugs: ["gueterstand-ehevertrag-schweiz"]
  }
];

export default function GuideIndexPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Ratgeber</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Standesamtliche Hochzeit planen</h1>
        <p className="mt-3 max-w-3xl text-soft-ink">
          Schritt für Schritt geordnet: vom offiziellen Überblick über Dokumente bis zu rechtlichen und finanziellen Fragen.
        </p>
      </div>
      {guideSections.map((section) => {
        const sectionGuides = section.slugs
          .map((slug) => guides.find((guide) => guide.slug === slug))
          .filter((guide): guide is GuideArticle => Boolean(guide));

        return (
          <section key={section.title} className="grid gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-ink">{section.title}</h2>
              <p className="mt-1 text-sm leading-6 text-soft-ink">{section.description}</p>
            </div>
            <div className="grid gap-4">
              {sectionGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/ratgeber/${guide.slug}`}
                  className="rounded-xl border border-linen bg-white p-5 shadow-soft transition hover:bg-linen/70"
                >
                  {guide.sourceName ? (
                    <span className="mb-3 inline-flex rounded-full bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-champagne">
                      Offizielle Quelle
                    </span>
                  ) : null}
                  <h3 className="text-xl font-semibold text-ink">{guide.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-soft-ink">{guide.excerpt}</p>
                  {guide.sourceName ? <p className="mt-3 text-xs font-semibold text-sage">Quelle: {guide.sourceName}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
