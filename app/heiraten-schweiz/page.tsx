import Link from "next/link";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Standesamtlich heiraten in der Schweiz: Ablauf",
  description: "Die fünf wichtigsten Schritte von der Ehevorbereitung über die Wahl des Trauorts bis zur standesamtlichen Trauung in der Schweiz.",
  path: "/heiraten-schweiz"
});

type JourneyStep = {
  icon: string;
  title: string;
  text: string;
  link?: readonly [string, string];
  featured?: boolean;
};

const steps: readonly JourneyStep[] = [
  {
    icon: "💍",
    title: "Wir wollen heiraten",
    text: "Bevor ihr euren Trautermin plant, werden zuerst die administrativen Voraussetzungen für die Eheschliessung geklärt.",
    link: ["/ratgeber/heiraten-schweiz-offizielle-informationen", "Offizielle Grundlagen ansehen →"]
  },
  {
    icon: "📄",
    title: "Ehe vorbereiten",
    text: "Das zuständige Zivilstandsamt führt das Ehevorbereitungsverfahren durch, prüft eure Voraussetzungen und teilt euch mit, welche Unterlagen in eurer Situation nötig sind.",
    link: ["/ratgeber/dokumente-standesamtliche-hochzeit", "Dokumente für die Hochzeit →"]
  },
  {
    icon: "🏛️",
    title: "Trauort finden",
    text: "Wo möchtet ihr heiraten? Entdeckt Standesämter und offizielle Traulokale in der ganzen Schweiz.",
    link: ["/", "Standesämter & Traulokale entdecken →"],
    featured: true
  },
  {
    icon: "📅",
    title: "Termin organisieren",
    text: "Wählt euren Wunschort, klärt die Verfügbarkeit und kontaktiert das zuständige Zivilstandsamt, um Termin und Trauort zu organisieren.",
    link: ["/ratgeber/heiraten-schweiz-ablauf", "Ablauf Schritt für Schritt →"]
  },
  {
    icon: "❤️",
    title: "Heiraten",
    text: "Nach abgeschlossener Ehevorbereitung folgt die standesamtliche Trauung – euer offizielles Ja-Wort. Verbindliche Details bestätigt euch das zuständige Zivilstandsamt."
  }
];

export default function WeddingJourneyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Hochzeits-Journey Schweiz</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">Euer Weg zum Ja-Wort</h1>
        <p className="mt-5 text-lg leading-8 text-soft-ink">So läuft eine standesamtliche Hochzeit in der Schweiz ab – von der ersten Vorbereitung bis zur Trauung.</p>
      </header>

      <ol className="mt-10 grid gap-5">
        {steps.map((step, index) => (
          <li key={step.title} className={`rounded-xl border p-6 shadow-soft sm:p-8 ${step.featured ? "border-champagne/50 bg-paper" : "border-linen bg-white"}`}>
            <article className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-6">
              <div className="flex items-center gap-3 sm:flex-col">
                <span className="text-3xl" aria-hidden="true">{step.icon}</span>
                <span className="text-xs font-semibold text-champagne">0{index + 1}</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-ink">{step.title}</h2>
                <p className="mt-3 max-w-3xl leading-7 text-soft-ink">{step.text}</p>
                {step.link ? (
                  <Link href={step.link[0]} className={`focus-ring mt-5 inline-flex rounded-lg px-4 py-2 font-semibold transition ${step.featured ? "bg-sage text-white hover:bg-sage/90" : "border border-sage/15 text-sage hover:border-sage/30"}`}>
                    {step.link[1]}
                  </Link>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </main>
  );
}
