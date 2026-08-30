import { headers } from "next/headers";
import Link from "next/link";
import { guides } from "@/lib/data";
import { defaultLocale, hreflangForLocale, indexableLocales, isLocale, type Locale, withLocalePath } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";
import type { GuideArticle } from "@/lib/types";

type GuideCopy = { title: string; excerpt: string };
type PageCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  journeyEyebrow: string;
  journeyTitle: string;
  journeyDescription: string;
  journeySteps: string[];
  journeyAria: string;
  journeyAction: string;
  sections: { title: string; description: string; slugs: string[] }[];
  officialSource: string;
  source: string;
  germanOnly: string;
  guides: Record<string, GuideCopy>;
};

const sectionSlugs = {
  start: ["heiraten-schweiz-offizielle-informationen", "heiraten-schweiz-ablauf"],
  documents: ["dokumente-standesamtliche-hochzeit", "offizielle-merkblaetter-bundesamt-justiz"],
  law: ["gueterstand-ehevertrag-schweiz"]
};

const copy: Record<"de" | "fr" | "it" | "en", PageCopy> = {
  de: {
    metaTitle: "Ratgeber zur standesamtlichen Hochzeit",
    metaDescription: "Praktische Informationen zu Ablauf, Dokumenten und Planung der Ziviltrauung in der Schweiz.",
    eyebrow: "Ratgeber",
    title: "Standesamtliche Hochzeit planen",
    intro: "Schritt für Schritt geordnet: vom offiziellen Überblick über Dokumente bis zu rechtlichen und finanziellen Fragen.",
    journeyEyebrow: "Euer Weg zum Ja-Wort",
    journeyTitle: "Wie funktioniert eine standesamtliche Hochzeit in der Schweiz?",
    journeyDescription: "Wenn ihr noch nicht wisst, wo ihr anfangen sollt: Die Hochzeits-Journey führt euch von der Ehevorbereitung bis zur Trauung.",
    journeySteps: ["Start", "Vorbereitung", "Trauort", "Termin", "Heiraten"],
    journeyAria: "Die fünf Schritte der Hochzeits-Journey",
    journeyAction: "Hochzeits-Journey entdecken",
    sections: [
      { title: "Start & Ablauf", description: "Die wichtigsten Grundlagen, bevor ihr beim Zivilstandsamt startet.", slugs: sectionSlugs.start },
      { title: "Dokumente & offizielle Merkblätter", description: "Unterlagen, Merkblätter und offizielle Hinweise für die Vorbereitung.", slugs: sectionSlugs.documents },
      { title: "Recht & finanzielle Folgen", description: "Themen, bei denen eine frühzeitige rechtliche Einordnung sinnvoll sein kann.", slugs: sectionSlugs.law }
    ],
    officialSource: "Offizielle Quelle",
    source: "Quelle:",
    germanOnly: "Artikel auf Deutsch",
    guides: {}
  },
  fr: {
    metaTitle: "Guides pour le mariage civil",
    metaDescription: "Informations pratiques sur le déroulement, les documents et la planification du mariage civil en Suisse.",
    eyebrow: "Guides",
    title: "Planifier son mariage civil",
    intro: "Une progression étape par étape : des informations officielles et des documents aux questions juridiques et financières.",
    journeyEyebrow: "Votre parcours vers le oui",
    journeyTitle: "Comment se déroule un mariage civil en Suisse ?",
    journeyDescription: "Si vous ne savez pas encore par où commencer, ce parcours vous guide de la préparation du mariage jusqu’à la cérémonie.",
    journeySteps: ["Départ", "Préparation", "Lieu", "Date", "Mariage"],
    journeyAria: "Les cinq étapes du parcours de mariage",
    journeyAction: "Découvrir le parcours du mariage",
    sections: [
      { title: "Début et déroulement", description: "Les bases essentielles avant de commencer les démarches auprès de l’office de l’état civil.", slugs: sectionSlugs.start },
      { title: "Documents et notices officielles", description: "Documents, notices et informations officielles pour préparer votre mariage.", slugs: sectionSlugs.documents },
      { title: "Droit et conséquences financières", description: "Les sujets pour lesquels une clarification juridique précoce peut être utile.", slugs: sectionSlugs.law }
    ],
    officialSource: "Source officielle",
    source: "Source :",
    germanOnly: "Article disponible en allemand",
    guides: {
      "heiraten-schweiz-offizielle-informationen": { title: "Officiel : se marier en Suisse", excerpt: "Les principales informations officielles sur les conditions, la préparation, la cérémonie, les coûts et le nom de famille." },
      "heiraten-schweiz-ablauf": { title: "Se marier en Suisse : les étapes", excerpt: "De la préparation du mariage à la cérémonie : les principales étapes expliquées clairement." },
      "dokumente-standesamtliche-hochzeit": { title: "Quels documents faut-il pour un mariage civil ?", excerpt: "Aperçu des documents généralement demandés et des points à vérifier avec votre office de l’état civil." },
      "offizielle-merkblaetter-bundesamt-justiz": { title: "Notices officielles de l’Office fédéral de la justice", excerpt: "Accès structuré aux notices officielles utiles pour préparer un mariage civil." },
      "gueterstand-ehevertrag-schweiz": { title: "Régime matrimonial et contrat de mariage en Suisse", excerpt: "Les bases du régime matrimonial et les situations dans lesquelles un conseil juridique peut être utile." }
    }
  },
  it: {
    metaTitle: "Guide al matrimonio civile",
    metaDescription: "Informazioni pratiche su procedura, documenti e pianificazione del matrimonio civile in Svizzera.",
    eyebrow: "Guide",
    title: "Pianificare il matrimonio civile",
    intro: "Un percorso ordinato passo dopo passo: dalle informazioni ufficiali e dai documenti agli aspetti giuridici e finanziari.",
    journeyEyebrow: "Il vostro percorso verso il sì",
    journeyTitle: "Come si svolge un matrimonio civile in Svizzera?",
    journeyDescription: "Se non sapete da dove iniziare, questo percorso vi guida dalla preparazione del matrimonio fino alla cerimonia.",
    journeySteps: ["Inizio", "Preparazione", "Luogo", "Data", "Matrimonio"],
    journeyAria: "Le cinque tappe del percorso matrimoniale",
    journeyAction: "Scoprire il percorso matrimoniale",
    sections: [
      { title: "Inizio e procedura", description: "Le basi essenziali prima di avviare la pratica presso l’ufficio dello stato civile.", slugs: sectionSlugs.start },
      { title: "Documenti e schede ufficiali", description: "Documenti, schede e informazioni ufficiali per preparare il matrimonio.", slugs: sectionSlugs.documents },
      { title: "Diritto e conseguenze finanziarie", description: "Temi per i quali può essere utile un chiarimento giuridico tempestivo.", slugs: sectionSlugs.law }
    ],
    officialSource: "Fonte ufficiale",
    source: "Fonte:",
    germanOnly: "Articolo disponibile in tedesco",
    guides: {
      "heiraten-schweiz-offizielle-informationen": { title: "Ufficiale: sposarsi in Svizzera", excerpt: "Le principali informazioni ufficiali su requisiti, preparazione, cerimonia, costi e scelta del cognome." },
      "heiraten-schweiz-ablauf": { title: "Sposarsi in Svizzera: le tappe", excerpt: "Dalla preparazione alla cerimonia: le tappe più importanti spiegate in modo semplice." },
      "dokumente-standesamtliche-hochzeit": { title: "Quali documenti servono per il matrimonio civile?", excerpt: "Panoramica dei documenti generalmente richiesti e degli aspetti da verificare con l’ufficio dello stato civile." },
      "offizielle-merkblaetter-bundesamt-justiz": { title: "Schede ufficiali dell’Ufficio federale di giustizia", excerpt: "Accesso strutturato alle schede ufficiali utili per preparare un matrimonio civile." },
      "gueterstand-ehevertrag-schweiz": { title: "Regime dei beni e contratto matrimoniale in Svizzera", excerpt: "Le basi del regime dei beni e le situazioni in cui può essere utile una consulenza giuridica." }
    }
  },
  en: {
    metaTitle: "Civil wedding guides",
    metaDescription: "Practical information about the process, documents and planning of a civil wedding in Switzerland.",
    eyebrow: "Guides",
    title: "Plan your civil wedding",
    intro: "A clear step-by-step path from official information and documents to legal and financial questions.",
    journeyEyebrow: "Your path to saying yes",
    journeyTitle: "How does a civil wedding work in Switzerland?",
    journeyDescription: "If you are unsure where to begin, this journey guides you from marriage preparation to the ceremony.",
    journeySteps: ["Start", "Preparation", "Venue", "Date", "Marriage"],
    journeyAria: "The five steps of the wedding journey",
    journeyAction: "Explore the wedding journey",
    sections: [
      { title: "Getting started and the process", description: "The essentials before starting the process with the civil registry office.", slugs: sectionSlugs.start },
      { title: "Documents and official fact sheets", description: "Documents, fact sheets and official information for preparing your wedding.", slugs: sectionSlugs.documents },
      { title: "Legal and financial consequences", description: "Topics where early legal clarification may be helpful.", slugs: sectionSlugs.law }
    ],
    officialSource: "Official source",
    source: "Source:",
    germanOnly: "Article available in German",
    guides: {
      "heiraten-schweiz-offizielle-informationen": { title: "Official information: getting married in Switzerland", excerpt: "Key official information about requirements, preparation, the ceremony, costs and choosing a family name." },
      "heiraten-schweiz-ablauf": { title: "Getting married in Switzerland: the process", excerpt: "From marriage preparation to the ceremony: the key steps explained clearly." },
      "dokumente-standesamtliche-hochzeit": { title: "Which documents are needed for a civil wedding?", excerpt: "An overview of commonly required documents and the details to confirm with your civil registry office." },
      "offizielle-merkblaetter-bundesamt-justiz": { title: "Official fact sheets from the Federal Office of Justice", excerpt: "Structured access to official fact sheets for preparing a civil wedding." },
      "gueterstand-ehevertrag-schweiz": { title: "Matrimonial property and marriage contracts in Switzerland", excerpt: "The basics of matrimonial property law and when legal advice may be useful." }
    }
  }
};

async function requestedLocale(): Promise<Locale> {
  const value = (await headers()).get("x-site-locale") ?? defaultLocale;
  return isLocale(value) ? value : defaultLocale;
}

function pageCopy(locale: Locale) {
  return copy[locale as keyof typeof copy] ?? copy.de;
}

function localizedSourceName(sourceName: string, locale: Locale) {
  const translations: Partial<Record<Locale, Record<string, string>>> = {
    fr: {
      "ch.ch - Eine Dienstleistung des Bundes, der Kantone und Gemeinden": "ch.ch – un service de la Confédération, des cantons et des communes",
      "Bundesamt für Justiz BJ - Eidgenössisches Amt für das Zivilstandswesen EAZW": "Office fédéral de la justice OFJ – Office fédéral de l’état civil OFEC"
    },
    it: {
      "ch.ch - Eine Dienstleistung des Bundes, der Kantone und Gemeinden": "ch.ch – un servizio della Confederazione, dei Cantoni e dei Comuni",
      "Bundesamt für Justiz BJ - Eidgenössisches Amt für das Zivilstandswesen EAZW": "Ufficio federale di giustizia UFG – Ufficio federale dello stato civile UFSC"
    },
    en: {
      "ch.ch - Eine Dienstleistung des Bundes, der Kantone und Gemeinden": "ch.ch – a service of the Confederation, cantons and communes",
      "Bundesamt für Justiz BJ - Eidgenössisches Amt für das Zivilstandswesen EAZW": "Federal Office of Justice FOJ – Federal Civil Status Office FCSO"
    }
  };
  return translations[locale]?.[sourceName] ?? sourceName;
}

export async function generateMetadata() {
  const locale = await requestedLocale();
  const current = pageCopy(locale);
  const path = "/ratgeber";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hochzeitstandesamt.ch";
  const metadata = createMetadata({
    title: current.metaTitle,
    description: current.metaDescription,
    path: withLocalePath(path, locale),
    locale: hreflangForLocale(locale).replace("-", "_")
  });

  return {
    ...metadata,
    alternates: {
      canonical: `${baseUrl}${withLocalePath(path, locale)}`,
      languages: {
        ...Object.fromEntries(indexableLocales.map((item) => [hreflangForLocale(item), `${baseUrl}${withLocalePath(path, item)}`])),
        "x-default": `${baseUrl}${path}`
      }
    }
  };
}

export default async function GuideIndexPage() {
  const locale = await requestedLocale();
  const current = pageCopy(locale);
  const localized = locale !== defaultLocale;
  const stepIcons = ["💍", "📄", "🏛️", "📅", "❤️"];

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{current.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">{current.title}</h1>
        <p className="mt-3 max-w-3xl text-soft-ink">{current.intro}</p>
      </div>
      <section className="rounded-2xl border border-champagne/40 bg-paper p-6 shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{current.journeyEyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">{current.journeyTitle}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-soft-ink">{current.journeyDescription}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-ink" aria-label={current.journeyAria}>
          {current.journeySteps.map((step, index) => (
            <span key={step} className="contents">
              <span>{stepIcons[index]} {step}</span>
              {index < current.journeySteps.length - 1 ? <span className="text-champagne" aria-hidden="true">→</span> : null}
            </span>
          ))}
        </div>
        <Link href="/heiraten-schweiz" hrefLang="de" className="focus-ring mt-6 inline-flex rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90">
          {current.journeyAction} →
        </Link>
        {localized ? <p className="mt-3 text-xs font-semibold text-soft-ink">{current.germanOnly}</p> : null}
      </section>
      {current.sections.map((section) => {
        const sectionGuides = section.slugs
          .map((slug) => guides.find((guide) => guide.slug === slug))
          .filter((guide): guide is GuideArticle => Boolean(guide));

        return (
          <section key={section.title} className="grid gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-ink">{section.title}</h2>
              <p className="mt-1 text-sm leading-6 text-soft-ink">{section.description}</p>
            </div>
            <div className="grid gap-4">
              {sectionGuides.map((guide) => {
                const translatedGuide = current.guides[guide.slug];
                return (
                  <Link key={guide.slug} href={`/ratgeber/${guide.slug}`} hrefLang="de" className="rounded-xl border border-linen bg-white p-5 shadow-soft transition hover:bg-linen/70">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {guide.sourceName ? <span className="inline-flex rounded-full bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-champagne">{current.officialSource}</span> : null}
                      {localized ? <span className="inline-flex rounded-full bg-linen px-3 py-1 text-xs font-semibold text-soft-ink">{current.germanOnly}</span> : null}
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{translatedGuide?.title ?? guide.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-soft-ink">{translatedGuide?.excerpt ?? guide.excerpt}</p>
                    {guide.sourceName ? <p className="mt-3 text-xs font-semibold text-sage">{current.source} {localizedSourceName(guide.sourceName, locale)}</p> : null}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
