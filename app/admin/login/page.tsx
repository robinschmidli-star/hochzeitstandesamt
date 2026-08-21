import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin-Anmeldung",
  robots: { index: false, follow: false }
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next?.startsWith("/admin/") ? params.next : "/admin/leads";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-16">
      <section className="w-full rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-stone-500">Geschützter Bereich</p>
        <h1 className="mt-2 text-4xl font-semibold">Admin-Anmeldung</h1>
        <p className="mt-3 text-sm text-stone-600">Melde dich an, um Leads und Analytics einzusehen.</p>
        {params.error ? (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            Benutzername oder Passwort ist nicht korrekt.
          </p>
        ) : null}
        <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm font-medium text-stone-800">
            Benutzername
            <input className="focus-ring mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" name="username" autoComplete="username" required />
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Passwort
            <input className="focus-ring mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="focus-ring w-full rounded-lg bg-stone-900 px-4 py-2.5 font-semibold text-white hover:bg-stone-700" type="submit">
            Anmelden
          </button>
        </form>
      </section>
    </main>
  );
}
