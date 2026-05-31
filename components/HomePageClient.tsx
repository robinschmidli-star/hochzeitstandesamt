"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { registryCantons, swissRegistryOffices } from "@/lib/registry-data";
import { officeMapPoints } from "@/lib/office-map-points";
import { registryOfficeMedia } from "@/lib/safe-media";
import { swissLakePaths, swissMunicipalityPaths } from "@/lib/swiss-detail-map-paths";
import { swissCantonPaths } from "@/lib/swiss-map-paths";
import type { SwissRegistryOffice } from "@/lib/types";

type Language = "de" | "fr" | "it" | "en" | "es" | "nl";

const translations = {
  de: {
    languageLabel: "Sprache",
    extraLanguageLabel: "Weitere Sprache",
    extraLanguagePlaceholder: "z.B. Spanisch, Portugiesisch",
    note: "Die Homepage wird sofort in der gewählten Sprache angezeigt.",
    eyebrow: "Schweizer Zivilstandsämter",
    headline: "Standesamt finden und Hochzeit in der Schweiz richtig planen",
    subheadline:
      "Finde das passende Zivilstandsamt über Kanton, Gemeinde oder Postleitzahl und starte deine standesamtliche Hochzeit mit klaren nächsten Schritten.",
    primaryCta: "Standesamt finden",
    secondaryCta: "Ablauf ansehen",
    canton: "Kanton",
    allCantons: "Alle Kantone",
    city: "Stadt oder Gemeinde",
    cityPlaceholder: "z.B. Winterthur oder 8400",
    date: "Hochzeitsdatum",
    email: "E-Mail für Checkliste (optional)",
    searchButton: "Standesamt finden",
    privacyNotice:
      "Mit Klick auf \"Standesamt finden\" speichern wir deine Angaben, um dir passende Informationen zur standesamtlichen Hochzeit und eine Checkliste bereitzustellen. Details findest du in unserer Datenschutzerklärung.",
    marketingOptIn:
      "Ich möchte passende Tipps und Angebote rund um meine Hochzeit per E-Mail erhalten. Ich kann mich jederzeit abmelden.",    mapEyebrow: "Interaktive Schweizkarte",
    mapTitle: "Nach Kanton auswählen",
    mapText: "Jeder Punkt führt direkt zu den Zivilstandsämtern und Gemeinden im gewählten Kanton.",
    mapBridge: "Oder wähle dein Standesamt direkt über die Schweizerkarte aus.",
    steps: ["Zuständigkeit klären", "Unterlagen vorbereiten", "Termin vereinbaren"],
    stepTexts: [
      "Suche deine Gemeinde oder deinen Kanton und finde den zuständigen Zivilstandskreis.",
      "Prüfe frühzeitig, welche Dokumente für eure persönliche Situation nötig sind.",
      "Nach der Ehevorbereitung könnt ihr den Trautermin direkt mit dem Amt koordinieren."
    ],
    dataEyebrow: "Datenbasis",
    dataTitle: "Alle Kantone und Zivilstandskreise",
    offices: "Zivilstandskreise",
    municipalityLinks: "Gemeinde-Zuordnungen",
    address: "Adresse",
    contact: "Kontakt",
    municipalities: "Gemeinden",
    details: "Details ansehen",
    faqTitle: "Häufige Fragen",
    faqText: "Kurz, praktisch und auf die standesamtliche Trauung fokussiert.",
    disclaimer:
      "Die Informationen auf hochzeitstandesamt.ch dienen der Orientierung. Verbindliche Auskünfte erhältst du direkt beim zuständigen Zivilstandsamt oder der offiziellen Behörde.",
    faq: [
      {
        question: "Wie finde ich das zuständige Zivilstandsamt?",
        answer:
          "Suche nach deiner Gemeinde, deinem Kanton oder der Postleitzahl. Die Seite zeigt dir den zugehörigen Zivilstandskreis aus der importierten Schweizer Liste."
      },
      {
        question: "Sind die Informationen verbindlich?",
        answer:
          "Nein. Die Angaben dienen zur Orientierung. Für verbindliche Auskünfte und Termine kontaktierst du immer direkt das zuständige Zivilstandsamt."
      },
      {
        question: "Kann ich nach Gemeinde statt nach Amt suchen?",
        answer:
          "Ja. Viele Gemeinden gehören zu regionalen Zivilstandskreisen, und diese Zuordnung wird berücksichtigt."
      }
    ]
  },
  fr: {
    languageLabel: "Langue",
    extraLanguageLabel: "Autre langue",
    extraLanguagePlaceholder: "p. ex. espagnol, portugais",
    note: "La page d'accueil s'affiche immédiatement dans la langue choisie.",
    eyebrow: "Offices de l'état civil suisses",
    headline: "Trouver l'office de l'état civil et bien préparer son mariage en Suisse",
    subheadline:
      "Trouvez l'office compétent par canton, commune ou code postal et commencez votre mariage civil avec des étapes claires.",
    primaryCta: "Chercher un office",
    secondaryCta: "Voir les étapes",
    canton: "Canton",
    allCantons: "Tous les cantons",
    city: "Ville ou commune",
    cityPlaceholder: "p. ex. Lausanne, 1014",
    date: "Date du mariage",
    email: "E-mail pour la checklist",
    searchButton: "Trouver l'office",
    mapEyebrow: "Carte suisse interactive",
    mapTitle: "Choisir par canton",
    mapText: "Chaque point ouvre directement les offices et communes du canton sélectionné.",
    mapBridge: "Ou choisissez votre office directement sur la carte de Suisse.",
    steps: ["Vérifier la compétence", "Préparer les documents", "Fixer le rendez-vous"],
    stepTexts: [
      "Recherchez votre commune ou canton pour trouver l'arrondissement compétent.",
      "Vérifiez tôt les documents nécessaires selon votre situation personnelle.",
      "Après la procédure préparatoire, vous pouvez coordonner la date avec l'office."
    ],
    dataEyebrow: "Base de données",
    dataTitle: "Tous les cantons et arrondissements de l'état civil",
    offices: "arrondissements",
    municipalityLinks: "communes reliées",
    address: "Adresse",
    contact: "Contact",
    municipalities: "Communes",
    details: "Voir les détails",
    faqTitle: "Questions fréquentes",
    faqText: "Des réponses courtes et pratiques sur le mariage civil.",
    disclaimer:
      "Les informations sur hochzeitstandesamt.ch servent d'orientation. Les renseignements contraignants sont fournis directement par l'office de l'état civil compétent ou l'autorité officielle.",
    faq: [
      {
        question: "Comment trouver l'office compétent?",
        answer:
          "Cherchez votre commune, votre canton ou votre code postal. La page affiche l'arrondissement correspondant selon la liste importée."
      },
      {
        question: "Les informations sont-elles contraignantes?",
        answer:
          "Non. Elles servent d'orientation. Pour les renseignements contraignants et les rendez-vous, contactez directement l'office compétent."
      },
      {
        question: "Puis-je chercher par commune?",
        answer:
          "Oui. De nombreuses communes relèvent d'arrondissements régionaux, et cette attribution est prise en compte."
      }
    ]
  },
  it: {
    languageLabel: "Lingua",
    extraLanguageLabel: "Altra lingua",
    extraLanguagePlaceholder: "ad es. spagnolo, portoghese",
    note: "La homepage viene mostrata subito nella lingua selezionata.",
    eyebrow: "Uffici dello stato civile svizzeri",
    headline: "Trova l'ufficio dello stato civile e pianifica bene il matrimonio in Svizzera",
    subheadline:
      "Trova l'ufficio competente per cantone, comune o codice postale e inizia il matrimonio civile con passi chiari.",
    primaryCta: "Cercare ufficio",
    secondaryCta: "Vedere procedura",
    canton: "Cantone",
    allCantons: "Tutti i cantoni",
    city: "Città o comune",
    cityPlaceholder: "es. Lugano, 6900",
    date: "Data del matrimonio",
    email: "E-mail per checklist",
    searchButton: "Trovare ufficio",
    mapEyebrow: "Mappa interattiva della Svizzera",
    mapTitle: "Selezionare per cantone",
    mapText: "Ogni punto porta direttamente agli uffici e ai comuni del cantone selezionato.",
    mapBridge: "Oppure selezionate l'ufficio direttamente dalla cartina della Svizzera.",
    steps: ["Verificare la competenza", "Preparare i documenti", "Fissare l'appuntamento"],
    stepTexts: [
      "Cerca il tuo comune o cantone per trovare il circondario competente.",
      "Verifica per tempo quali documenti servono per la vostra situazione personale.",
      "Dopo la preparazione del matrimonio potete coordinare la data con l'ufficio."
    ],
    dataEyebrow: "Base dati",
    dataTitle: "Tutti i cantoni e circondari dello stato civile",
    offices: "circondari",
    municipalityLinks: "comuni collegati",
    address: "Indirizzo",
    contact: "Contatto",
    municipalities: "Comuni",
    details: "Vedere dettagli",
    faqTitle: "Domande frequenti",
    faqText: "Risposte brevi e pratiche sul matrimonio civile.",
    disclaimer:
      "Le informazioni su hochzeitstandesamt.ch servono come orientamento. Le informazioni vincolanti sono fornite direttamente dall'ufficio dello stato civile competente o dall'autorité ufficiale.",
    faq: [
      {
        question: "Come trovo l'ufficio competente?",
        answer:
          "Cerca il tuo comune, cantone o codice postale. La pagina mostra il circondario corrispondente dalla lista importata."
      },
      {
        question: "Le informazioni sono vincolanti?",
        answer:
          "No. Servono come orientamento. Per informazioni vincolanti e appuntamenti contatta direttamente l'ufficio competente."
      },
      {
        question: "Posso cercare per comune?",
        answer:
          "Sì. Molti comuni appartengono a circondari regionali e questa attribuzione viene considerata."
      }
    ]
  },
  en: {
    languageLabel: "Language",
    extraLanguageLabel: "Additional language",
    extraLanguagePlaceholder: "e.g. Spanish, Portuguese",
    note: "The homepage updates immediately in the selected language.",
    eyebrow: "Swiss civil registry offices",
    headline: "Find a civil registry office and plan your wedding in Switzerland properly",
    subheadline:
      "Find the right civil registry office by canton, municipality or postal code and start your civil wedding planning with clear next steps.",
    primaryCta: "Search registry office",
    secondaryCta: "View process",
    canton: "Canton",
    allCantons: "All cantons",
    city: "City or municipality",
    cityPlaceholder: "e.g. Zurich, 8001",
    date: "Wedding date",
    email: "Email for checklist",
    searchButton: "Find registry office",
    mapEyebrow: "Interactive Swiss map",
    mapTitle: "Select by canton",
    mapText: "Each point opens the civil registry offices and municipalities in the selected canton.",
    mapBridge: "Or choose your registry office directly on the Swiss map.",
    steps: ["Check responsibility", "Prepare documents", "Book appointment"],
    stepTexts: [
      "Search your municipality or canton and find the responsible civil registry district.",
      "Check early which documents are required for your personal situation.",
      "After the marriage preparation procedure, coordinate the ceremony date with the office."
    ],
    dataEyebrow: "Data basis",
    dataTitle: "All cantons and civil registry districts",
    offices: "registry districts",
    municipalityLinks: "municipality links",
    address: "Address",
    contact: "Contact",
    municipalities: "Municipalities",
    details: "View details",
    faqTitle: "Frequently asked questions",
    faqText: "Short, practical answers focused on civil weddings.",
    disclaimer:
      "The information on hochzeitstandesamt.ch is for orientation only. Binding information is provided directly by the responsible civil registry office or official authority.",
    faq: [
      {
        question: "How do I find the responsible civil registry office?",
        answer:
          "Search by municipality, canton or postal code. The page shows the matching registry district from the imported Swiss list."
      },
      {
        question: "Is the information legally binding?",
        answer:
          "No. It is for orientation only. For binding information and appointments, contact the responsible civil registry office directly."
      },
      {
        question: "Can I search by municipality instead of office name?",
        answer:
          "Yes. Many municipalities belong to regional civil registry districts, and this assignment is included."
      }
    ]
  },
  es: {
    languageLabel: "Idioma",
    extraLanguageLabel: "Otro idioma",
    extraLanguagePlaceholder: "Srpski",
    note: "La página de inicio se muestra inmediatamente en el idioma seleccionado.",
    eyebrow: "Oficinas suizas del registro civil",
    headline: "Encuentra la oficina del registro civil y planifica tu boda en Suiza correctamente",
    subheadline:
      "Encuentra la oficina competente por cantón, municipio o código postal y empieza la planificación de tu boda civil con pasos claros.",
    primaryCta: "Buscar oficina",
    secondaryCta: "Ver proceso",
    canton: "Cantón",
    allCantons: "Todos los cantones",
    city: "Ciudad o municipio",
    cityPlaceholder: "p. ej. Zürich, 8001",
    date: "Fecha de boda",
    email: "E-mail para checklist",
    searchButton: "Encontrar oficina",
    mapEyebrow: "Mapa interactivo de Suiza",
    mapTitle: "Seleccionar por cantón",
    mapText: "Cada punto abre directamente las oficinas y municipios del cantón seleccionado.",
    mapBridge: "O elige tu oficina directamente en el mapa de Suiza.",
    steps: ["Comprobar competencia", "Preparar documentos", "Reservar cita"],
    stepTexts: [
      "Busca tu municipio o cantón y encuentra el distrito competente del registro civil.",
      "Comprueba con tiempo qué documentos se requieren para vuestra situación personal.",
      "Después del procedimiento preparatorio, coordinad la fecha de la ceremonia con la oficina."
    ],
    dataEyebrow: "Base de datos",
    dataTitle: "Todos los cantones y distritos del registro civil",
    offices: "distritos del registro civil",
    municipalityLinks: "asignaciones municipales",
    address: "Dirección",
    contact: "Contacto",
    municipalities: "Municipios",
    details: "Ver detalles",
    faqTitle: "Preguntas frecuentes",
    faqText: "Respuestas breves y prácticas sobre la boda civil.",
    disclaimer:
      "La información en hochzeitstandesamt.ch sirve solo como orientación. La información vinculante la proporciona directamente la oficina del registro civil competente o la autoridad oficial.",
    faq: [
      {
        question: "¿Cómo encuentro la oficina competente?",
        answer:
          "Busca por municipio, cantón o código postal. La página muestra el distrito correspondiente de la lista suiza importada."
      },
      {
        question: "¿La información es vinculante?",
        answer:
          "No. Sirve como orientación. Para información vinculante y citas, contacta directamente con la oficina competente."
      },
      {
        question: "¿Puedo buscar por municipio?",
        answer:
          "Sí. Muchos municipios pertenecen a distritos regionales del registro civil y esta asignación se tiene en cuenta."
      }
    ]
  },
  nl: {
    languageLabel: "Taal",
    extraLanguageLabel: "Andere taal",
    extraLanguagePlaceholder: "Srpski",
    note: "De homepage wordt direct in de gekozen taal weergegeven.",
    eyebrow: "Zwitserse burgerlijke stand",
    headline: "Vind het juiste registerkantoor en plan je huwelijk in Zwitserland goed",
    subheadline:
      "Vind het bevoegde kantoor via kanton, gemeente of postcode en begin je burgerlijk huwelijk met duidelijke volgende stappen.",
    primaryCta: "Registerkantoor zoeken",
    secondaryCta: "Proces bekijken",
    canton: "Kanton",
    allCantons: "Alle kantons",
    city: "Stad of gemeente",
    cityPlaceholder: "bijv. Zürich, 8001",
    date: "Huwelijksdatum",
    email: "E-mail voor checklist",
    searchButton: "Registerkantoor vinden",
    mapEyebrow: "Interactieve Zwitserlandkaart",
    mapTitle: "Selecteren per kanton",
    mapText: "Elk kanton opent direct de burgerlijke stand en gemeenten in het gekozen kanton.",
    mapBridge: "Of kies je registerkantoor direct via de Zwitserlandkaart.",
    steps: ["Bevoegdheid controleren", "Documenten voorbereiden", "Afspraak maken"],
    stepTexts: [
      "Zoek je gemeente of kanton en vind het bevoegde district van de burgerlijke stand.",
      "Controleer vroeg welke documenten nodig zijn voor jullie persoonlijke situatie.",
      "Na de huwelijksvoorbereiding kunnen jullie de ceremoniedatum met het kantoor afstemmen."
    ],
    dataEyebrow: "Databasis",
    dataTitle: "Alle kantons en districten van de burgerlijke stand",
    offices: "registerdistricten",
    municipalityLinks: "gemeentelijke toewijzingen",
    address: "Adres",
    contact: "Contact",
    municipalities: "Gemeenten",
    details: "Details bekijken",
    faqTitle: "Veelgestelde vragen",
    faqText: "Korte, praktische antwoorden over het burgerlijk huwelijk.",
    disclaimer:
      "De informatie op hochzeitstandesamt.ch dient alleen ter oriëntatie. Bindende informatie krijg je rechtstreeks van het bevoegde kantoor van de burgerlijke stand of de officiële autoriteit.",
    faq: [
      {
        question: "Hoe vind ik het bevoegde registerkantoor?",
        answer:
          "Zoek op gemeente, kanton of postcode. De pagina toont het passende district uit de geïmporteerde Zwitserse lijst."
      },
      {
        question: "Is de informatie bindend?",
        answer:
          "Nee. De informatie dient ter oriëntatie. Voor bindende informatie en afspraken neem je direct contact op met het bevoegde kantoor."
      },
      {
        question: "Kan ik zoeken op gemeente?",
        answer:
          "Ja. Veel gemeenten behoren tot regionale districten van de burgerlijke stand en deze toewijzing wordt meegenomen."
      }
    ]
  }
};

const languageNames: Record<Language, string> = {
  de: "Deutsch",
  fr: "Französisch",
  it: "Italienisch",
  en: "English",
  es: "Español",
  nl: "Nederlands"
};

const primaryLanguageOptions: { code: Language; label: string }[] = [
  { code: "de", label: "CH Deutsch" },
  { code: "fr", label: "FR Französisch" },
  { code: "it", label: "IT Italienisch" },
  { code: "en", label: "GB English" }
];

const extraLanguageToCode: Record<string, Language> = {
  Nederlands: "nl",
  "Español": "es",
  English: "en",
  "Français": "fr",
  Italiano: "it",
  Deutsch: "de"
};

const additionalLanguages = [
  "Srpski",
  "Shqip",
  "Português",
  "Türkçe",
  "Hrvatski",
  "Bosanski",
  "Slovenščina",
  "Română",
  "Polski",
  "Čeština",
  "Slovenčina",
  "Magyar",
  "Ukrainian",
  "Russian",
  "Greek",
  "Arabic",
  "Persian",
  "Kurdî",
  "Tamil",
  "Hindi",
  "Chinese",
  "Japanese",
  "Korean",
  "Nederlands",
  "Svenska",
  "Dansk",
  "Norsk",
  "Suomi"
];

export function HomePageClient() {
  const [language, setLanguage] = useState<Language>("de");
  const [extraLanguage, setExtraLanguage] = useState("");
  const t = translations[language];
  const featuredOffices = useMemo(() => swissRegistryOffices.slice(0, 3), []);
  const municipalityCount = useMemo(
    () => registryCantons.reduce((sum, canton) => sum + canton.municipalityCount, 0),
    []
  );
  const handleExtraLanguageChange = (value: string) => {
    setExtraLanguage(value);
    const mappedLanguage = extraLanguageToCode[value.trim()];
    if (mappedLanguage) {
      setLanguage(mappedLanguage);
    }
  };

  return (
    <main>
      <UnifiedLanguageChooser
        t={t}
        language={language}
        extraLanguage={extraLanguage}
        onLanguageChange={setLanguage}
        onExtraLanguageChange={handleExtraLanguageChange}
      />
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 pb-1 pt-10 sm:px-6 lg:px-8 lg:pb-2 lg:pt-16">
          <div>
            <UnifiedMobileLanguageChooser
              t={t}
              language={language}
              extraLanguage={extraLanguage}
              onLanguageChange={setLanguage}
              onExtraLanguageChange={handleExtraLanguageChange}
            />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.1em] text-champagne md:mt-0">{t.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] text-ink sm:text-6xl">{t.headline}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-soft-ink">{t.subheadline}</p>
            <div className="mt-7 max-w-none rounded-xl border border-linen bg-white p-4 shadow-soft sm:p-5">
              <LocalizedSearchForm t={t} />
              <div className="mt-2">
                <h2 className="text-xl font-semibold text-ink">{t.mapTitle}</h2>
                <LocalizedSwissMap t={t} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ablauf" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {t.steps.map((title, index) => (
            <article key={title} className="rounded-xl border border-linen bg-white p-6">
              <span className="text-sm font-semibold text-champagne">0{index + 1}</span>
              <h2 className="mt-3 text-xl font-semibold text-ink">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-soft-ink">{t.stepTexts[index]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">{t.dataEyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">{t.dataTitle}</h2>
          </div>
          <p className="text-sm text-soft-ink">
            {swissRegistryOffices.length} {t.offices} · {municipalityCount} {t.municipalityLinks}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredOffices.map((office) => (
            <LocalizedOfficeCard key={office.slug} office={office} t={t} />
          ))}
        </div>
        <div>
          <Link
            href="/standesamt-finden"
            className="focus-ring inline-flex rounded-lg bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90"
          >
            Anzeigen sämtlicher Zivilstandsämter
          </Link>
        </div>
      </section>

      <section className="bg-linen/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold text-ink">{t.faqTitle}</h2>
            <p className="mt-3 text-soft-ink">{t.faqText}</p>
          </div>
          <div className="grid gap-3">
            {t.faq.map((item) => (
              <details key={item.question} className="rounded-xl border border-linen bg-white p-5 shadow-soft">
                <summary className="cursor-pointer font-semibold text-ink">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-soft-ink">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <aside className="rounded-xl border border-champagne/30 bg-white p-4 text-sm leading-6 text-soft-ink shadow-soft">
          {t.disclaimer}
        </aside>
      </section>
    </main>
  );
}

function TopLanguageChooser({
  t,
  language,
  extraLanguage,
  onLanguageChange,
  onExtraLanguageChange
}: {
  t: (typeof translations)[Language];
  language: Language;
  extraLanguage: string;
  onLanguageChange: (language: Language) => void;
  onExtraLanguageChange: (value: string) => void;
}) {
  return (
    <div className="fixed right-4 top-3 z-50 hidden max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-ink/10 bg-white/95 px-2 py-2 shadow-soft backdrop-blur md:flex">
      <div
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linen text-xs font-bold text-ink"
        title={t.languageLabel}
      >
        文/A
      </div>
      <label className="sr-only" htmlFor="homepage-language">
        {t.languageLabel}
      </label>
      <select
        id="homepage-language"
        value={language}
        onChange={(event) => onLanguageChange(event.target.value as Language)}
        className="focus-ring h-9 rounded-full border border-ink/15 bg-white px-3 text-sm font-semibold text-ink"
      >
        {(Object.keys(languageNames) as Language[]).map((code) => (
          <option key={code} value={code}>
            {languageNames[code]}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="homepage-extra-language">
        {t.extraLanguageLabel}
      </label>
      <input
        id="homepage-extra-language"
        value={extraLanguage}
        onChange={(event) => onExtraLanguageChange(event.target.value)}
        placeholder="Srpski"
        list="additional-language-options"
        className="focus-ring h-9 w-36 rounded-full border border-ink/15 px-3 text-sm text-soft-ink"
      />
      <datalist id="additional-language-options">
        {additionalLanguages.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </div>
  );
}

function MobileLanguageChooser({
  t,
  language,
  extraLanguage,
  onLanguageChange,
  onExtraLanguageChange
}: {
  t: (typeof translations)[Language];
  language: Language;
  extraLanguage: string;
  onLanguageChange: (language: Language) => void;
  onExtraLanguageChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-linen bg-white p-4 shadow-soft md:hidden">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-linen text-xs font-bold text-ink">
          文/A
        </div>
        <label className="grid flex-1 gap-2 text-sm font-medium text-ink">
          {t.languageLabel}
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value as Language)}
          className="focus-ring rounded-lg border border-linen bg-white px-3 py-3 text-soft-ink"
        >
          {(Object.keys(languageNames) as Language[]).map((code) => (
            <option key={code} value={code}>
              {languageNames[code]}
            </option>
          ))}
        </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-ink">
        {t.extraLanguageLabel}
        <input
          value={extraLanguage}
          onChange={(event) => onExtraLanguageChange(event.target.value)}
          placeholder="Srpski"
          list="mobile-additional-language-options"
          className="focus-ring rounded-lg border border-linen px-3 py-3 text-soft-ink"
        />
      </label>
      <datalist id="mobile-additional-language-options">
        {additionalLanguages.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </div>
  );
}

function UnifiedLanguageChooser({
  t,
  language,
  extraLanguage,
  onLanguageChange,
  onExtraLanguageChange
}: {
  t: (typeof translations)[Language];
  language: Language;
  extraLanguage: string;
  onLanguageChange: (language: Language) => void;
  onExtraLanguageChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showOtherLanguages, setShowOtherLanguages] = useState(false);
  const [query, setQuery] = useState(extraLanguage);
  const filteredLanguages = additionalLanguages
    .filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 8);

  const chooseLanguage = (nextLanguage: Language) => {
    onLanguageChange(nextLanguage);
    setIsOpen(false);
    setShowOtherLanguages(false);
  };

  const chooseOtherLanguage = (value: string) => {
    setQuery(value);
    onExtraLanguageChange(value);
    if (extraLanguageToCode[value]) {
      setIsOpen(false);
      setShowOtherLanguages(false);
    }
  };

  return (
    <div className="fixed right-4 top-3 z-50 hidden md:block">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="focus-ring flex items-center gap-2 rounded-full border border-ink/10 bg-white/95 px-2 py-2 text-sm font-semibold text-ink shadow-soft backdrop-blur"
        aria-expanded={isOpen}
      >
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linen text-xs font-bold">
          文/A
        </span>
        <span>{languageNames[language]}</span>
        <span aria-hidden="true" className="text-soft-ink">⌄</span>
      </button>
      {isOpen ? (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-linen bg-white p-2 shadow-soft">
          <div className="grid gap-1">
            {primaryLanguageOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => chooseLanguage(option.code)}
                className={`rounded-md px-3 py-2 text-left text-sm font-semibold transition hover:bg-linen/70 ${
                  language === option.code ? "bg-linen text-ink" : "text-soft-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowOtherLanguages((value) => !value)}
              className="rounded-md border-t border-ink/10 px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-linen/70"
            >
              Andere Sprache...
            </button>
          </div>
          {showOtherLanguages ? (
            <div className="mt-2 border-t border-ink/10 pt-2">
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  onExtraLanguageChange(event.target.value);
                }}
                placeholder="Srpski"
                className="focus-ring w-full rounded-lg border border-linen px-3 py-2 text-sm text-soft-ink"
              />
              <div className="mt-2 max-h-56 overflow-auto">
                {filteredLanguages.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => chooseOtherLanguage(item)}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-soft-ink transition hover:bg-linen/70 hover:text-ink"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function UnifiedMobileLanguageChooser({
  t,
  language,
  extraLanguage,
  onLanguageChange,
  onExtraLanguageChange
}: {
  t: (typeof translations)[Language];
  language: Language;
  extraLanguage: string;
  onLanguageChange: (language: Language) => void;
  onExtraLanguageChange: (value: string) => void;
}) {
  const [showOtherLanguages, setShowOtherLanguages] = useState(false);
  const [query, setQuery] = useState(extraLanguage);
  const filteredLanguages = additionalLanguages
    .filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 8);

  const chooseOtherLanguage = (value: string) => {
    setQuery(value);
    onExtraLanguageChange(value);
    if (extraLanguageToCode[value]) {
      setShowOtherLanguages(false);
    }
  };

  return (
    <div className="grid gap-3 rounded-xl border border-linen bg-white p-4 shadow-soft md:hidden">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-linen text-xs font-bold text-ink">
          文/A
        </div>
        <label className="grid flex-1 gap-2 text-sm font-medium text-ink">
          {t.languageLabel}
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value as Language)}
            className="focus-ring rounded-lg border border-linen bg-white px-3 py-3 text-soft-ink"
          >
            {primaryLanguageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={() => setShowOtherLanguages((value) => !value)}
        className="rounded-md border border-ink/10 px-3 py-2 text-left text-sm font-semibold text-ink"
      >
        Andere Sprache...
      </button>
      {showOtherLanguages ? (
        <div className="grid gap-2">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              onExtraLanguageChange(event.target.value);
            }}
            placeholder="Srpski"
            className="focus-ring rounded-lg border border-linen px-3 py-3 text-soft-ink"
          />
          <div className="grid max-h-56 overflow-auto">
            {filteredLanguages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => chooseOtherLanguage(item)}
                className="rounded-md px-3 py-2 text-left text-sm text-soft-ink transition hover:bg-linen/70 hover:text-ink"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LocalizedSearchForm({ t }: { t: (typeof translations)[Language] }) {
  const privacyNotice = "privacyNotice" in t ? t.privacyNotice : translations.de.privacyNotice;
  const marketingOptIn = "marketingOptIn" in t ? t.marketingOptIn : translations.de.marketingOptIn;
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<string>();

    swissRegistryOffices.forEach((office) => {
      suggestions.add(office.city);
      suggestions.add(office.postalCode);
      suggestions.add(`${office.postalCode} ${office.city}`);
      office.responsibleMunicipalities.forEach((municipality) => suggestions.add(municipality));
    });

    return Array.from(suggestions).sort((a, b) => a.localeCompare(b, "de-CH"));
  }, []);

  return (
    <form action="/standesamt-finden" className="grid gap-3">
      <div className="grid gap-3">
        <div className="grid items-end gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.55fr)_minmax(180px,240px)]">
          <label className="grid min-w-0 gap-1.5 text-sm font-medium text-ink">
            Stadt oder PLZ
            <input name="query" inputMode="search" list="municipality-search-suggestions" placeholder={t.cityPlaceholder} className="focus-ring h-11 w-full rounded-lg border border-linen px-3 text-soft-ink" />
            <datalist id="municipality-search-suggestions">
              {searchSuggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </label>
          <fieldset className="min-w-0 text-sm font-medium text-ink">
            <legend className="mb-1.5">Gewünschter Zeitraum</legend>
            <div className="grid grid-cols-2 gap-2">
              <input name="dateStart" type="date" aria-label="Von" className="focus-ring h-11 w-full rounded-lg border border-linen px-3 text-soft-ink" />
              <input name="dateEnd" type="date" aria-label="Bis" className="focus-ring h-11 w-full rounded-lg border border-linen px-3 text-soft-ink" />
            </div>
          </fieldset>
          <button className="focus-ring h-11 rounded-lg bg-sage px-5 font-semibold text-white transition hover:bg-sage/90">
            {t.searchButton}
          </button>
        </div>
        <details className="group rounded-lg border border-linen bg-paper/45 px-3 py-2">
          <summary className="cursor-pointer list-none text-sm font-semibold text-sage marker:hidden">
            Zusatzfilter anzeigen
            <span className="ml-1 text-soft-ink transition group-open:hidden">+</span>
            <span className="ml-1 hidden text-soft-ink transition group-open:inline">-</span>
          </summary>
          <div className="mt-3 grid gap-3 border-t border-linen pt-3">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid min-w-0 gap-1.5 text-sm font-medium text-ink">
                {t.canton}
                <select name="canton" className="focus-ring h-11 w-full rounded-lg border border-linen bg-white px-3 text-soft-ink">
                  <option value="">{t.allCantons}</option>
                  {registryCantons.map((canton) => (
                    <option key={canton.code} value={canton.code}>
                      {canton.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid min-w-0 gap-2">
                <label className="grid min-w-0 gap-1.5 text-sm font-medium text-ink">
                  {t.email}
                  <input name="email" type="email" placeholder="name@example.ch" className="focus-ring h-11 w-full rounded-lg border border-linen px-3 text-soft-ink" />
                </label>
                <label className="flex gap-3 text-sm leading-6 text-soft-ink">
                  <input name="marketingOptIn" type="checkbox" value="yes" className="mt-1 h-4 w-4 rounded border-linen accent-sage" />
                  <span>{marketingOptIn}</span>
                </label>
              </div>
            </div>
            <fieldset className="grid gap-2 text-sm font-medium text-ink">
              <legend>Bevorzugte Trautage</legend>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <label key={day} className="cursor-pointer">
                    <input type="checkbox" name="preferredWeekdays" value={day} className="peer sr-only" />
                    <span className="inline-flex min-w-11 justify-center rounded-full border border-linen bg-white px-3 py-2 text-sm font-semibold text-soft-ink transition peer-checked:border-sage peer-checked:bg-sage peer-checked:text-white">
                      {day}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </details>
      </div>
      <p className="text-[11px] leading-5 text-soft-ink/75">{privacyNotice}</p>
    </form>
  );
}

function LocalizedSwissMap({ t }: { t: (typeof translations)[Language] }) {
  const [selectedCanton, setSelectedCanton] = useState<string | null>(null);
  const [activeOfficeSlug, setActiveOfficeSlug] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const selectedShape = swissCantonPaths.find((shape) => shape.code === selectedCanton);
  const selectedCantonInfo = registryCantons.find((canton) => canton.code === selectedCanton);
  const selectedOfficePoints = selectedCanton
    ? officeMapPoints
        .filter((point) => point.canton === selectedCanton)
        .map((point) => ({
          ...point,
          office: swissRegistryOffices.find((office) => office.slug === point.slug)
        }))
        .filter((point) => point.office)
    : [];
  const activeOfficePoint = selectedOfficePoints.find((point) => point.slug === activeOfficeSlug);
  const baseViewBox = selectedShape
    ? {
        x: Math.max(selectedShape.bounds[0] - 14, 0),
        y: Math.max(selectedShape.bounds[1] - 14, 0),
        width: selectedShape.bounds[2] - selectedShape.bounds[0] + 28,
        height: selectedShape.bounds[3] - selectedShape.bounds[1] + 28
      }
    : { x: -35, y: 120, width: 1070, height: 470 };
  const appliedZoom = selectedShape ? zoomLevel : 1;
  const viewBoxWidth = baseViewBox.width / appliedZoom;
  const viewBoxHeight = baseViewBox.height / appliedZoom;
  const viewBox = `${baseViewBox.x + (baseViewBox.width - viewBoxWidth) / 2} ${baseViewBox.y + (baseViewBox.height - viewBoxHeight) / 2} ${viewBoxWidth} ${viewBoxHeight}`;

  const zoomIn = () => {
    if (!selectedShape) return;
    setZoomLevel((value) => Math.min(value + 0.25, 1.45));
  };

  const zoomOut = () => {
    if (!selectedShape) return;
    if (zoomLevel <= 1) {
      setSelectedCanton(null);
      setActiveOfficeSlug(null);
      return;
    }
    setZoomLevel((value) => Math.max(value - 0.35, 1));
  };

  return (
    <section>
      <div className="relative mt-2 overflow-hidden rounded-xl border border-linen bg-paper/70 p-2 sm:p-3">
        {selectedCantonInfo ? (
          <button
            type="button"
            onClick={() => {
              setSelectedCanton(null);
              setActiveOfficeSlug(null);
              setZoomLevel(1);
            }}
            className="focus-ring absolute right-4 top-4 z-10 rounded-lg border border-sage/15 bg-white px-3 py-1.5 text-sm font-semibold text-ink shadow-soft transition hover:border-sage/30 hover:text-sage"
          >
            Zurück zur Schweiz
          </button>
        ) : null}
        <div className="absolute left-5 top-5 z-10 overflow-hidden rounded-xl border border-linen bg-white shadow-soft">
          <button
            type="button"
            onClick={zoomIn}
            disabled={!selectedShape || zoomLevel >= 1.45}
            aria-label="In Karte hineinzoomen"
            className="focus-ring flex h-10 w-10 items-center justify-center border-b border-linen text-xl font-semibold text-sage transition hover:bg-paper disabled:cursor-not-allowed disabled:text-soft-ink/35"
          >
            +
          </button>
          <button
            type="button"
            onClick={zoomOut}
            disabled={!selectedShape}
            aria-label="Aus Karte hinauszoomen"
            className="focus-ring flex h-10 w-10 items-center justify-center text-xl font-semibold text-sage transition hover:bg-paper disabled:cursor-not-allowed disabled:text-soft-ink/35"
          >
            -
          </button>
        </div>
        <svg viewBox={viewBox} role="img" aria-label="Schweizerkarte mit auswählbaren Kantonen" className="h-[150px] w-full transition-all duration-500 sm:h-[200px] lg:h-[240px]">
          <defs>
            <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#24211f" floodOpacity="0.12" />
            </filter>
            {selectedShape ? (
              <clipPath id="selectedCantonClip">
                <path d={selectedShape.d} />
              </clipPath>
            ) : null}
          </defs>
          <g filter={selectedShape ? undefined : "url(#mapShadow)"}>
            {swissCantonPaths.map((shape) => {
              const canton = registryCantons.find((item) => item.code === shape.code);
              if (!canton) return null;
              return (
                <a
                  key={shape.code}
                  href={`/standesamt-finden?canton=${shape.code}`}
                  aria-label={`${canton.name}: ${canton.officeCount} ${t.offices}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setSelectedCanton(shape.code);
                    setActiveOfficeSlug(null);
                    setZoomLevel(1);
                  }}
                >
                  <path
                    d={shape.d}
                    className={`transition hover:fill-champagne focus:fill-champagne ${
                      selectedCanton === shape.code
                        ? "fill-white stroke-sage/35 stroke-[1.8]"
                        : selectedCanton
                          ? "fill-transparent stroke-transparent opacity-0"
                          : "fill-white stroke-white stroke-[2]"
                    }`}
                  >
                    <title>{`${canton.name}: ${canton.officeCount} ${t.offices}`}</title>
                  </path>
                </a>
              );
            })}
          </g>
          {selectedShape ? (
            <g clipPath="url(#selectedCantonClip)" className="pointer-events-none">
              {swissMunicipalityPaths.map((shape) => (
                <path key={`municipality-${shape.id}`} d={shape.d} className="fill-transparent stroke-sage/15 stroke-[0.35]" />
              ))}
              {swissLakePaths.map((shape) => (
                <path key={`lake-${shape.id}`} d={shape.d} className="fill-[#f7f5f2] stroke-white stroke-[0.4]" />
              ))}
            </g>
          ) : null}
          {!selectedCanton ? swissCantonPaths.map((shape) => {
            const canton = registryCantons.find((item) => item.code === shape.code);
            if (!canton) return null;
            return (
              <a key={`${shape.code}-label`} href={`/standesamt-finden?canton=${shape.code}`} aria-hidden="true">
                <text
                  x={shape.label[0]}
                  y={shape.label[1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="pointer-events-none fill-ink text-[22px] font-bold"
                >
                  {shape.code}
                </text>
              </a>
            );
          }) : null}
          {selectedOfficePoints.map((point) => {
            const isActive = point.slug === activeOfficeSlug;
            return (
              <g
                key={point.slug}
                role="button"
                tabIndex={0}
                aria-label={point.office?.name}
                onClick={() => setActiveOfficeSlug(point.slug)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveOfficeSlug(point.slug);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isActive ? "3.8" : "2.4"}
                  className={`stroke-white transition ${
                    isActive ? "fill-champagne stroke-[1.3]" : "fill-sage stroke-[0.9] hover:fill-champagne"
                  }`}
                />
                <title>{point.office?.name}</title>
              </g>
            );
          })}
        </svg>
        {activeOfficePoint?.office ? (
          <div className="mt-4 rounded-xl border border-linen bg-white p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-champagne">
              {activeOfficePoint.office.cantonName} · {activeOfficePoint.office.canton}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-ink">{activeOfficePoint.office.name}</h3>
            <p className="mt-2 text-sm leading-6 text-soft-ink">
              {activeOfficePoint.office.addressLine1}, {activeOfficePoint.office.postalCode} {activeOfficePoint.office.city}
            </p>
            <Link
              href={`/zivilstandsamt/${activeOfficePoint.office.slug}`}
              className="focus-ring mt-3 inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage/90"
            >
              Details ansehen
            </Link>
          </div>
        ) : null}
        {selectedCanton && selectedOfficePoints.length === 0 ? (
          <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-soft-ink">
            Für diesen Kanton sind die Ämter vorhanden; die genauen Ortsmarker werden ergänzt, sobald die Adressen geocodiert sind.
          </p>
        ) : null}
        <p className="mt-2 text-[11px] leading-5 text-soft-ink/70">
          Kartendaten: swiss-maps, basierend auf generalisierten Schweizer Verwaltungsgrenzen von swisstopo/BFS.
        </p>
      </div>
    </section>
  );
}

function LocalizedOfficeCard({ office, t }: { office: SwissRegistryOffice; t: (typeof translations)[Language] }) {
  const media = registryOfficeMedia(office);

  return (
    <article className="rounded-xl border border-linen bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">
            {office.cantonName} · {office.canton}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-ink">{office.name}</h2>
        </div>
        {media.url ? (
          <img src={media.url} alt={media.alt} className="h-12 w-12 object-contain" loading="lazy" />
        ) : null}
      </div>
      <dl className="mt-4 grid gap-2 text-sm text-soft-ink">
        <div>
          <dt className="font-semibold text-ink">{t.address}</dt>
          <dd>
            {office.addressLine1}, {office.postalCode} {office.city}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">{t.contact}</dt>
          <dd>
            {[office.phone, office.email].filter(Boolean).join(" · ") || "-"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">{t.municipalities}</dt>
          <dd>{office.responsibleMunicipalities.slice(0, 5).join(", ")}</dd>
        </div>
      </dl>
      <Link href={`/zivilstandsamt/${office.slug}`} className="focus-ring mt-5 inline-flex rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage/90">
        {t.details}
      </Link>
    </article>
  );
}
