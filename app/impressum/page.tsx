import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Impressum",
  description: "Impressum für hochzeitstandesamt.ch.",
  path: "/impressum"
});

export default function ImprintPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-ink">Impressum</h1>
      <div className="mt-6 grid gap-4 leading-8 text-soft-ink">
        <p>hochzeitstandesamt.ch</p>
        <p>RS Schmidli Consulting<br />Stockenerstrasse 23<br />8405 Winterthur<br />Schweiz</p>
        <p>E-Mail: <a className="font-semibold text-ink" href="mailto:kontakt@hochzeitstandesamt.ch">kontakt@hochzeitstandesamt.ch</a></p>
      </div>
    </main>
  );
}
