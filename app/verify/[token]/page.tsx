import { notFound } from "next/navigation";
import { VerificationForm } from "@/components/VerificationForm";
import { getDictionary } from "@/lib/i18n";
import { requestByToken } from "@/lib/verification";

export const dynamic = "force-dynamic";
export const metadata = { title: "Datenprüfung", robots: { index: false, follow: false } };

export default async function VerificationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const request = await requestByToken(token);
  if (!request || request.venueId) notFound();
  const labels = await getDictionary(request.languageCode);
  return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <p className="text-sm font-semibold uppercase tracking-widest text-champagne">hochzeitstandesamt.ch</p>
    <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{labels["verify.title"].replace("{name}", request.snapshot.office.name)}</h1>
    <p className="mb-8 mt-4 max-w-3xl leading-7 text-soft-ink">{labels["verify.intro"]}</p>
    <VerificationForm request={request} labels={labels} token={token}/>
  </main>;
}
