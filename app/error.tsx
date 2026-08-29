"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto grid max-w-3xl gap-5 px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Technischer Fehler</p>
      <h1 className="text-4xl font-semibold text-ink">Die Seite konnte nicht geladen werden</h1>
      <p className="text-soft-ink">Bitte versuche es erneut. Deine Sucheingaben bleiben in der URL erhalten.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="focus-ring rounded-lg bg-sage px-5 py-3 font-semibold text-white">
          Erneut versuchen
        </button>
        <Link href="/standesamt-finden" className="focus-ring rounded-lg border border-sage/15 px-5 py-3 font-semibold text-sage">
          Zur Suche
        </Link>
      </div>
    </main>
  );
}
