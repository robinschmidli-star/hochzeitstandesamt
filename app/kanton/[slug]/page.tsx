import Link from "next/link";
import { notFound } from "next/navigation";
import { OfficeCard } from "@/components/OfficeCard";
import { SearchForm } from "@/components/SearchForm";
import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import { createMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return registryCantons.map((canton) => ({ slug: canton.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const canton = registryCantons.find((item) => item.slug === slug);
  if (!canton) return {};
  return createMetadata({
    title: `Standesamt ${canton.name} - Zivilstandsämter im Kanton`,
    description: `Finde Zivilstandsämter und zuständige Gemeinden im Kanton ${canton.name}.`,
    path: `/kanton/${canton.slug}`
  });
}

export default async function CantonPage({ params }: Props) {
  const { slug } = await params;
  const canton = registryCantons.find((item) => item.slug === slug);
  if (!canton) notFound();
  const offices = swissRegistryOffices.filter((office) => office.canton === canton.code);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Kanton {canton.code}</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Standesamt im Kanton {canton.name}</h1>
        <p className="mt-3 max-w-3xl text-soft-ink">
          Im Kanton {canton.name} sind {offices.length} Zivilstandskreise und {canton.municipalityCount} Gemeinde-Zuordnungen in der Suche erfasst.
        </p>
      </div>
      <SearchForm compact />
      <div className="grid gap-4 md:grid-cols-2">
        {offices.map((office) => (
          <OfficeCard key={office.slug} office={office} />
        ))}
      </div>
      <Link href={`/standesamt-finden?canton=${canton.code}`} className="focus-ring justify-self-start rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
        Suche im Kanton {canton.name} öffnen
      </Link>
    </main>
  );
}
