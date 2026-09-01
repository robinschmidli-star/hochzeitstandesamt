import Link from "next/link";

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await searchParams;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-ink">Danke, deine Anfrage ist angekommen.</h1>
      <p className="mt-4 leading-8 text-soft-ink">
        Wir haben deine Angaben mit deiner Einwilligung gespeichert.
      </p>
      <Link href="/" className="focus-ring mt-8 inline-flex rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
        Zur Suche zurück
      </Link>
    </main>
  );
}
