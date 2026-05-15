import { notFound } from "next/navigation";
import { Faq } from "@/components/Faq";
import { ChecklistForm, FamilyLawLeadForm } from "@/components/LeadForm";
import { guides } from "@/lib/data";
import { createMetadata, faqSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return {};
  return createMetadata({
    title: guide.metaTitle ?? guide.title,
    description: guide.metaDescription ?? guide.excerpt,
    path: `/ratgeber/${guide.slug}`,
    type: "article"
  });
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();
  if (guide.slug === "gueterstand-ehevertrag-schweiz") return <FamilyLawGuidePage guide={guide} />;

  return (
    <main className="mx-auto grid max-w-4xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(guide.faq)) }} />
      <article className="rounded-xl border border-linen bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Ratgeber</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">{guide.title}</h1>
        <p className="mt-4 text-lg leading-8 text-soft-ink">{guide.excerpt}</p>
        {guide.sourceUrl ? (
          <aside className="mt-6 rounded-xl border border-champagne/30 bg-paper p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">Offizielle Quelle</p>
            <p className="mt-2 font-semibold text-ink">{guide.sourceName}</p>
            {guide.sourceDescription ? (
              <p className="mt-2 text-sm leading-6 text-soft-ink">{guide.sourceDescription}</p>
            ) : null}
            <a
              href={guide.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="focus-ring mt-3 inline-flex rounded-lg border border-sage/15 px-4 py-2 text-sm font-semibold text-sage transition hover:border-sage/30"
            >
              Original auf ch.ch ansehen
            </a>
          </aside>
        ) : null}
        <div className="mt-8 grid gap-4 text-soft-ink">
          {guide.content.map((paragraph) => (
            <p key={paragraph} className="leading-8">{paragraph}</p>
          ))}
        </div>
        {guide.officialLinks?.length ? (
          <section className="mt-8 grid gap-3">
            <h2 className="text-2xl font-semibold text-ink">Merkblätter direkt öffnen</h2>
            <div className="grid gap-3">
              {guide.officialLinks.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring rounded-xl border border-linen bg-paper p-4 transition hover:border-sage/25 hover:bg-white"
                >
                  <p className="font-semibold text-ink">{item.title}</p>
                  {item.meta ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-champagne">{item.meta}</p> : null}
                  <p className="mt-2 text-sm leading-6 text-soft-ink">{item.description}</p>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </article>
      <Faq items={guide.faq} />
      <ChecklistForm sourcePage={`/ratgeber/${guide.slug}`} />
    </main>
  );
}

function FamilyLawGuidePage({ guide }: { guide: (typeof guides)[number] }) {
  const regimes = [
    {
      title: "Errungenschaftsbeteiligung",
      badge: "Standard in der Schweiz",
      text: "Wenn kein Ehevertrag abgeschlossen wird, gilt in der Schweiz automatisch die Errungenschaftsbeteiligung."
    },
    {
      title: "Gütertrennung",
      badge: "Oft bei Vermögen, Immobilien oder Unternehmertum relevant",
      text: "Bei der Gütertrennung bleiben die Vermögen der Ehepartner grundsätzlich getrennt. Dafür ist ein Ehevertrag nötig."
    },
    {
      title: "Gütergemeinschaft",
      badge: "Vertraglich vereinbart",
      text: "Bei der Gütergemeinschaft wird bestimmtes Vermögen gemeinsames Vermögen. Auch dafür braucht es einen Ehevertrag."
    }
  ];
  const triggers = [
    "Einer von euch besitzt Immobilien",
    "Einer von euch ist selbständig oder Unternehmer/in",
    "Es bestehen grössere Vermögensunterschiede",
    "Es gibt Kinder aus früheren Beziehungen",
    "Erbschaften oder Schenkungen sind relevant",
    "Ihr habt unterschiedliche Nationalitäten oder Wohnsitze",
    "Ihr möchtet einen Ehevertrag prüfen oder erstellen lassen"
  ];

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(guide.faq)) }} />
      <section id="gueterstaende" className="grid gap-4 md:grid-cols-3">
        {regimes.map((item) => (
          <article key={item.title} className="rounded-xl border border-linen bg-white p-5 shadow-soft">
            <span className="inline-flex rounded-full bg-paper px-3 py-1 text-xs font-semibold text-champagne">{item.badge}</span>
            <h2 className="mt-4 text-2xl font-semibold text-ink">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-soft-ink">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-linen bg-white p-6 shadow-soft lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Offizielle Informationen verständlich erklärt</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink lg:text-5xl">
            Güterstand & Ehevertrag: Was Paare vor der Hochzeit wissen sollten
          </h1>
          <p className="mt-5 text-lg leading-8 text-soft-ink">
            Die Ehe hat nicht nur emotionale, sondern auch finanzielle und rechtliche Folgen. Wir erklären die wichtigsten Grundlagen verständlich
            und helfen euch bei Bedarf, passende Familienrechtsanwälte oder Notare in eurer Region zu finden.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-linen bg-white p-6 shadow-soft">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Keine Rechtsberatung durch die Plattform</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Wann lohnt sich eine Beratung?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-soft-ink">
            Die Informationen auf dieser Seite dienen der allgemeinen Orientierung. hochzeitstandesamt.ch ersetzt keine Beratung durch eine Anwältin,
            einen Anwalt, eine Notarin oder einen Notar.
          </p>
        </div>
        <ul className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {triggers.map((item) => (
            <li key={item} className="rounded-lg border border-linen bg-paper px-4 py-3 text-sm text-soft-ink">{item}</li>
          ))}
        </ul>
        <p className="mt-5 max-w-3xl leading-7 text-soft-ink">
          Wenn einer dieser Punkte auf euch zutrifft, kann eine kurze juristische Abklärung sinnvoll sein.
        </p>
        <a href="#ersteinschaetzung" className="focus-ring mt-5 inline-flex rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
          Passende Anwälte in meiner Region finden
        </a>
      </section>

      <FamilyLawLeadForm sourcePage={`/ratgeber/${guide.slug}`} />
      <Faq items={guide.faq} />
      <aside className="rounded-xl border border-champagne/30 bg-paper p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">Quelle</p>
        <p className="mt-2 font-semibold text-ink">{guide.sourceName}</p>
        <p className="mt-3 text-sm leading-6 text-soft-ink">{guide.sourceDescription}</p>
        <a href={guide.sourceUrl} target="_blank" rel="noreferrer" className="focus-ring mt-4 inline-flex text-sm font-semibold text-sage">
          Original auf ch.ch ansehen
        </a>
      </aside>
    </main>
  );
}
