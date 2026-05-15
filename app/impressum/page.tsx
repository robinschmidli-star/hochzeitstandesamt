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
        <p>Projekt im Aufbau. Betreiberangaben werden vor Veröffentlichung ergänzt.</p>
        <p>Kontakt: kontakt@hochzeitstandesamt.ch</p>
      </div>
    </main>
  );
}
