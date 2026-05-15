import Link from "next/link";
import { notFound } from "next/navigation";
import { OfficeCard } from "@/components/OfficeCard";
import { ChecklistForm } from "@/components/LeadForm";
import { getMunicipalityPage, municipalityPages } from "@/lib/municipalities";
import { swissRegistryOffices } from "@/lib/registry-data";
import { createMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return municipalityPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = getMunicipalityPage(slug);
  if (!page) return {};
  return createMetadata({
    title: `Standesamt ${page.name} - zuständiges Zivilstandsamt`,
    description: `Finde das zuständige Zivilstandsamt für ${page.name} im Kanton ${page.cantonName}.`,
    path: `/standesamt/${page.slug}`
  });
}

export default async function MunicipalityPage({ params }: Props) {
  const { slug } = await params;
  const page = getMunicipalityPage(slug);
  if (!page) notFound();
  const office = swissRegistryOffices.find((item) => item.slug === page.officeSlug);
  if (!office) notFound();

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{page.cantonName} · {page.canton}</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Standesamt für {page.name}</h1>
        <p className="mt-4 text-lg leading-8 text-soft-ink">
          Für {page.name} ist gemäss der importierten Liste dieser Zivilstandskreis hinterlegt.
        </p>
      </div>
      <OfficeCard office={office} />
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-linen bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-ink">So gehst du vor</h2>
          <p className="mt-3 leading-8 text-soft-ink">
            Kontaktiere das Amt, bestätige die Zuständigkeit für deine Situation und frage die persönliche Dokumentenliste an.
          </p>
          <Link href={`/zivilstandsamt/${office.slug}`} className="focus-ring mt-5 inline-flex rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
            Detailseite öffnen
          </Link>
        </div>
        <ChecklistForm sourcePage={`/standesamt/${page.slug}`} officeSlug={office.slug} />
      </section>
      <section className="rounded-xl border border-linen bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-ink">Güterstand & Ehevertrag</h2>
        <p className="mt-3 leading-7 text-soft-ink">
          Ergänzend zur Standesamt-Suche findet ihr hier eine verständliche Übersicht zu finanziellen Folgen der Ehe.
        </p>
        <Link href="/ratgeber/gueterstand-ehevertrag-schweiz" className="focus-ring mt-5 inline-flex rounded-lg border border-sage/15 px-5 py-3 font-semibold text-sage transition hover:border-sage/30">
          Ratgeber öffnen
        </Link>
      </section>
    </main>
  );
}
