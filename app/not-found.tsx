import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-3xl gap-5 px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">404</p>
      <h1 className="text-4xl font-semibold text-ink">Diese Seite wurde nicht gefunden</h1>
      <p className="text-soft-ink">
        Der Eintrag ist möglicherweise nicht mehr öffentlich oder die Adresse ist nicht korrekt.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/standesamt-finden" className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white">
          Standesamt finden
        </Link>
        <Link href="/" className="focus-ring rounded-lg border border-sage/15 px-5 py-3 font-semibold text-sage">
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}
