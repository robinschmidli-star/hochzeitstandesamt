import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Kontakt",
  description: "Kontakt zu hochzeitstandesamt.ch.",
  path: "/kontakt"
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-ink">Kontakt</h1>
      <p className="mt-4 leading-8 text-soft-ink">
        hochzeitstandesamt.ch ist im Aufbau. Für Hinweise zu Daten, Korrekturen oder Partnerschaften erreichst du uns unter{" "}
        <a className="font-semibold text-ink" href="mailto:kontakt@hochzeitstandesamt.ch">kontakt@hochzeitstandesamt.ch</a>.
      </p>
    </main>
  );
}
