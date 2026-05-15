import type { Canton, City, CivilRegistryOffice, GuideArticle, Vendor } from "@/lib/types";

export const cantons: Canton[] = [
  {
    id: "zh",
    name: "Zürich",
    slug: "zuerich",
    abbreviation: "ZH",
    description:
      "Im Kanton Zürich führen regionale Zivilstandsämter die Vorbereitung der Ehe und die Ziviltrauung durch. Termine und Unterlagen variieren je nach Situation."
  },
  {
    id: "be",
    name: "Bern",
    slug: "bern",
    abbreviation: "BE",
    description:
      "Der Kanton Bern bietet Ziviltrauungen in mehreren Regionen und Sprachen an. Paare klären zuerst das zuständige Zivilstandsamt."
  },
  {
    id: "bs",
    name: "Basel-Stadt",
    slug: "basel-stadt",
    abbreviation: "BS",
    description:
      "In Basel-Stadt finden Paare zentrale Informationen zur Eheschliessung, Vorbereitung und Trauorten beim Zivilstandsamt Basel-Stadt."
  },
  {
    id: "vd",
    name: "Vaud",
    slug: "vaud",
    abbreviation: "VD",
    description:
      "Im Kanton Waadt unterstuetzen die Offices d'etat civil Paare bei der Vorbereitung der Eheschliessung und der Wahl des Trauorts."
  }
];

export const cities: City[] = [
  {
    id: "winterthur",
    name: "Winterthur",
    slug: "winterthur",
    cantonSlug: "zuerich",
    postalCode: "8400",
    description: "Winterthur gehört zu den wichtigsten Standorten für standesamtliche Trauungen im Kanton Zürich."
  },
  {
    id: "zuerich",
    name: "Zürich",
    slug: "zuerich",
    cantonSlug: "zuerich",
    postalCode: "8001",
    description: "Die Stadt Zürich bietet Ziviltrauungen in urbanem Rahmen und mit guter Erreichbarkeit."
  },
  {
    id: "bern",
    name: "Bern",
    slug: "bern",
    cantonSlug: "bern",
    postalCode: "3011",
    description: "Bern ist ein zentraler Ort für die Vorbereitung der Ehe und die Ziviltrauung in der Region."
  },
  {
    id: "basel",
    name: "Basel",
    slug: "basel",
    cantonSlug: "basel-stadt",
    postalCode: "4001",
    description: "Basel verbindet kurze Wege zu Behörden mit stilvollen Möglichkeiten für den Hochzeitstag."
  }
];

export const registryOffices: CivilRegistryOffice[] = [
  {
    id: "winterthur",
    name: "Zivilstandsamt Winterthur",
    slug: "winterthur",
    cantonSlug: "zuerich",
    citySlug: "winterthur",
    addressLine1: "Pionierstrasse 7",
    postalCode: "8403",
    city: "Winterthur",
    phone: "+41 52 267 57 57",
    email: "zivilstandsamt@win.ch",
    websiteUrl: "https://stadt.winterthur.ch/themen/leben-in-winterthur/personliches/heirat-eintragung-partnerschaft",
    appointmentUrl: "https://stadt.winterthur.ch",
    openingHours: "Termine nach Vereinbarung; aktuelle Öffnungszeiten bitte offiziell prüfen.",
    languages: ["Deutsch", "Englisch auf Anfrage"],
    responsibleMunicipalities: ["Winterthur", "Brütten", "Dinhard", "Elsau", "Hettlingen", "Neftenbach", "Seuzach", "Wiesendangen"],
    description:
      "Das Zivilstandsamt Winterthur begleitet Paare bei der Vorbereitung der Ehe, prüft Unterlagen und führt Ziviltrauungen in der Region durch.",
    documentsInfo:
      "In der Regel werden Ausweise, Wohnsitznachweise und je nach Herkunft weitere Zivilstandsdokumente benötigt. Verbindliche Vorgaben erhältst du direkt beim Amt.",
    ceremonyInfo:
      "Ziviltrauungen finden nach bestätigter Ehevorbereitung statt. Wunschtermine sollten frühzeitig angefragt werden.",
    sourceUrl: "https://stadt.winterthur.ch",
    lastVerifiedAt: "2026-05-09"
  },
  {
    id: "zuerich",
    name: "Zivilstandsamt Stadt Zürich",
    slug: "zuerich",
    cantonSlug: "zuerich",
    citySlug: "zuerich",
    addressLine1: "Stadthausquai 17",
    postalCode: "8001",
    city: "Zürich",
    phone: "+41 44 412 31 50",
    email: "zivilstandsamt@zuerich.ch",
    websiteUrl: "https://www.stadt-zuerich.ch/prd/de/index/bevoelkerungsamt/zivilstandsamt.html",
    appointmentUrl: "https://www.stadt-zuerich.ch",
    openingHours: "Aktuelle Schalterzeiten und Terminfenster auf der offiziellen Website prüfen.",
    languages: ["Deutsch", "Englisch auf Anfrage"],
    responsibleMunicipalities: ["Zürich"],
    description:
      "Das Zivilstandsamt der Stadt Zürich ist für Eheschliessungen und Zivilstandsereignisse in der Stadt Zürich zuständig.",
    documentsInfo:
      "Die nötigen Dokumente hängen von Nationalität, Wohnsitz und Zivilstand ab. Das Amt informiert über die persönlichen Anforderungen.",
    ceremonyInfo:
      "Die Stadt Zürich bietet standesamtliche Trauungen an offiziellen Orten und nach Verfügbarkeit an.",
    sourceUrl: "https://www.stadt-zuerich.ch",
    lastVerifiedAt: "2026-05-09"
  },
  {
    id: "bern",
    name: "Zivilstandsamt Bern-Mittelland",
    slug: "bern-mittelland",
    cantonSlug: "bern",
    citySlug: "bern",
    addressLine1: "Laupenstrasse 18a",
    postalCode: "3008",
    city: "Bern",
    phone: "+41 31 635 42 00",
    email: "za.mittelland@be.ch",
    websiteUrl: "https://www.zivilstand.sid.be.ch",
    openingHours: "Termine und Schalterzeiten bitte offiziell beim Kanton Bern prüfen.",
    languages: ["Deutsch", "Französisch"],
    responsibleMunicipalities: ["Bern", "Koeniz", "Ostermundigen", "Muri bei Bern", "Belp"],
    description:
      "Das Zivilstandsamt Bern-Mittelland betreut Paare in der Region Bern bei Ehevorbereitung, Dokumentenprüfung und Trauung.",
    documentsInfo:
      "Für die Ehevorbereitung werden amtliche Dokumente verlangt. Bei ausländischen Dokumenten kann eine Übersetzung oder Beglaubigung nötig sein.",
    ceremonyInfo:
      "Ziviltrauungen werden nach erfolgreicher Vorbereitung reserviert. Freie Termine können saisonal knapp sein.",
    sourceUrl: "https://www.zivilstand.sid.be.ch",
    lastVerifiedAt: "2026-05-09"
  },
  {
    id: "basel-stadt",
    name: "Zivilstandsamt Basel-Stadt",
    slug: "basel-stadt",
    cantonSlug: "basel-stadt",
    citySlug: "basel",
    addressLine1: "Rittergasse 11",
    postalCode: "4001",
    city: "Basel",
    phone: "+41 61 267 95 95",
    email: "zivilstandsamt@bs.ch",
    websiteUrl: "https://www.bs.ch",
    openingHours: "Bitte aktuelle Informationen und Termine auf der offiziellen Website prüfen.",
    languages: ["Deutsch", "Französisch auf Anfrage", "Englisch auf Anfrage"],
    responsibleMunicipalities: ["Basel", "Riehen", "Bettingen"],
    description:
      "Das Zivilstandsamt Basel-Stadt ist die zentrale Stelle für Eheschliessungen im Kanton Basel-Stadt.",
    documentsInfo:
      "Die Unterlagen richten sich nach persönlicher Situation, Wohnsitz und Nationalität. Das Amt bestätigt die definitive Liste.",
    ceremonyInfo:
      "Trautermine können nach Abschluss der Ehevorbereitung vereinbart werden.",
    sourceUrl: "https://www.bs.ch",
    lastVerifiedAt: "2026-05-09"
  }
];

export const guides: GuideArticle[] = [
  {
    title: "Güterstand & Ehevertrag in der Schweiz",
    slug: "gueterstand-ehevertrag-schweiz",
    metaTitle: "Güterstand & Ehevertrag Schweiz | Was Paare vor der Hochzeit wissen sollten",
    metaDescription:
      "Welche finanziellen Folgen hat eine Ehe in der Schweiz? Überblick zu Errungenschaftsbeteiligung, Gütertrennung, Gütergemeinschaft und Ehevertrag – mit regionaler Anwaltsvermittlung.",
    excerpt:
      "Überblick zu Errungenschaftsbeteiligung, Gütergemeinschaft, Gütertrennung und den finanziellen Folgen der Ehe.",
    sourceName: "ch.ch - Eine Dienstleistung des Bundes, der Kantone und Gemeinden",
    sourceUrl:
      "https://www.ch.ch/de/familie-und-partnerschaft/heirat--konkubinat--partenariat/wirtschaftliche-folgen-der-ehe-guterstand/",
    sourceDescription:
      "Zusammenfassung auf Basis der offiziellen ch.ch-Seite zu den wirtschaftlichen Folgen der Ehe und zum Güterstand. Für konkrete Fragen zum Ehevertrag oder Güterstand empfiehlt ch.ch den Kontakt mit einer Anwältin, einem Anwalt, einer Notarin oder einem Notar.",
    content: [
      "Die Ehe hat in der Schweiz finanzielle Folgen. Der Güterstand regelt, wem während der Ehe welches Vermögen gehört und wie Vermögen und Schulden bei Scheidung, Trennung oder Tod verteilt werden.",
      "In der Schweiz gibt es drei Güterstände: die Errungenschaftsbeteiligung, die Gütergemeinschaft und die Gütertrennung.",
      "Wenn kein Ehevertrag abgeschlossen wird, gilt automatisch die Errungenschaftsbeteiligung. Dabei behalten beide Ehegatten ihr Eigengut, also zum Beispiel Vermögen von vor der Ehe sowie Erbschaften oder Schenkungen. Die während der Ehe erzielten Ersparnisse werden bei Auflösung des Güterstands grundsätzlich hälftig geteilt.",
      "Wer eine Gütergemeinschaft oder Gütertrennung möchte, muss dafür einen Ehevertrag abschliessen. Dieser braucht die Form einer öffentlichen Urkunde und wird in der Regel von einer Notarin oder einem Notar erstellt.",
      "Bei der Gütergemeinschaft wird bestimmtes Vermögen gemeinsam verwaltet und bei Scheidung oder Trennung grundsätzlich hälftig aufgeteilt. Bei der Gütertrennung bleiben die Vermögen getrennt; im Scheidungs- oder Trennungsfall gibt es aus diesem Güterstand nichts zu verteilen.",
      "Unabhängig vom gewählten Güterstand werden verheiratete Paare gemeinsam besteuert und füllen gemeinsam eine Steuererklärung aus.",
      "Diese Seite bietet allgemeine Orientierung und keine Rechtsberatung. Für spezifische Fragen zum Güterstand, Ehevertrag, Steuern oder Vorsorge sollten Paare die zuständigen Fachpersonen oder Behörden kontaktieren."
    ],
    faq: [
      {
        question: "Welcher Güterstand gilt automatisch in der Schweiz?",
        answer:
          "Ohne Ehevertrag gilt in der Schweiz automatisch die Errungenschaftsbeteiligung."
      },
      {
        question: "Braucht man für Gütertrennung einen Ehevertrag?",
        answer:
          "Ja. Für Gütertrennung braucht es einen Ehevertrag in Form einer öffentlichen Urkunde."
      },
      {
        question: "Wann ist ein Ehevertrag sinnvoll?",
        answer:
          "Ein Ehevertrag kann sinnvoll sein, wenn Vermögen, Immobilien, Unternehmertum, Erbschaften, Kinder aus früheren Beziehungen oder internationale Bezüge eine Rolle spielen."
      },
      {
        question: "Wer kann einen Ehevertrag erstellen?",
        answer:
          "Ein Ehevertrag braucht eine öffentliche Beurkundung. In der Praxis helfen Notarinnen, Notare sowie Anwältinnen und Anwälte mit Erfahrung im Familienrecht."
      },
      {
        question: "Ist eine Beratung vor der Hochzeit sinnvoll?",
        answer:
          "Eine Beratung kann sinnvoll sein, wenn ihr rechtliche oder finanzielle Fragen klären möchtet. hochzeitstandesamt.ch bietet selbst keine Rechtsberatung, sondern vermittelt passende regionale Kontakte."
      }
    ]
  },  {
    title: "Offizielle Merkblätter des Bundesamts für Justiz",
    slug: "offizielle-merkblaetter-bundesamt-justiz",
    excerpt:
      "Die wichtigsten Merkblätter des Bundesamts für Justiz rund um Eheschliessung, Heirat im Ausland, Rechte und Pflichten sowie Namensführung.",
    sourceName: "Bundesamt für Justiz BJ - Eidgenössisches Amt für das Zivilstandswesen EAZW",
    sourceUrl: "https://www.bj.admin.ch/bj/de/home/gesellschaft/zivilstand/merkblaetter.html",
    sourceDescription:
      "Die Merkblätter stammen vom Bundesamt für Justiz. Sie dienen der Orientierung und haben keine rechtsbindende Wirkung; verbindlich sind die geltenden gesetzlichen Bestimmungen und die Auskunft der zuständigen Behörden.",
    content: [
      "Das Bundesamt für Justiz stellt offizielle Merkblätter zum Zivilstandswesen bereit. Für Paare sind vor allem die Merkblätter zur Eheschliessung in der Schweiz, zur Eheschliessung im Ausland, zu ehelichen Rechten und Pflichten sowie zur Namensführung relevant.",
      "Die Merkblätter erklären die zentralen Schritte und Zuständigkeiten. Dazu gehören das Ehevorbereitungsverfahren, die benötigten Dokumente, die zivile Trauung, die Anerkennung einer im Ausland geschlossenen Ehe und Hinweise zu Name und Bürgerrecht.",
      "Für konkrete Fragen ersetzt ein Merkblatt nicht die persönliche Abklärung beim zuständigen Zivilstandsamt, bei der Schweizer Vertretung im Ausland oder bei der zuständigen kantonalen Behörde."
    ],
    officialLinks: [
      {
        title: "Eheschliessung in der Schweiz",
        description:
          "Überblick zu Voraussetzungen, Ehevorbereitungsverfahren, Dokumenten, Trauung, Kosten und weiteren Fragen.",
        meta: "Merkblatt Nr. 150.1, Stand Juli 2022",
        url: "https://www.bj.admin.ch/dam/bj/de/data/gesellschaft/zivilstand/merkblaetter/ehe/mb-eheschliessung-schweiz.pdf.download.pdf/mb-eheschliessung-schweiz-d.pdf"
      },
      {
        title: "Eheschliessung im Ausland",
        description:
          "Hinweise zur Anerkennung einer im Ausland geschlossenen Ehe, Meldung an Schweizer Behörden und benötigten Dokumenten.",
        meta: "Merkblatt Nr. 150.2, Stand Juli 2022",
        url: "https://www.bj.admin.ch/dam/bj/de/data/gesellschaft/zivilstand/merkblaetter/ehe/auslandehe.pdf.download.pdf/auslandehe-d.pdf"
      },
      {
        title: "Ehe in der Schweiz: Rechte und Pflichten",
        description:
          "Kurzüberblick über wichtige rechtliche Wirkungen der Ehe in der Schweiz.",
        meta: "Merkblatt Nr. 150.3, Stand Juli 2022",
        url: "https://www.bj.admin.ch/dam/bj/de/data/gesellschaft/zivilstand/merkblaetter/ehe/mb-ehepflichten.pdf.download.pdf/mb-ehepflichten-d.pdf"
      },
      {
        title: "Umwandlung der eingetragenen Partnerschaft in eine Ehe",
        description:
          "Informationen für Paare, die eine bestehende eingetragene Partnerschaft in eine Ehe umwandeln möchten.",
        meta: "Merkblatt Nr. 150.4, Stand Mai 2025",
        url: "https://www.bj.admin.ch/dam/bj/de/data/gesellschaft/zivilstand/merkblaetter/ehe/umwandlung-partnerschaft-ehe.pdf.download.pdf/umwandlung-partnerschaft-ehe-d.pdf"
      },
      {
        title: "Namensführung bei Eheschliessung",
        description:
          "Informationen zu den Möglichkeiten der Namensführung bei der Heirat.",
        meta: "Merkblatt Nr. 153.1, Stand Juli 2014",
        url: "https://www.bj.admin.ch/dam/bj/de/data/gesellschaft/zivilstand/merkblaetter/name/mb-namensfuehrung-ehe.pdf.download.pdf/mb-namensfuehrung-ehe-d.pdf"
      }
    ],
    faq: [
      {
        question: "Sind die Merkblätter verbindlich?",
        answer:
          "Nein. Die Merkblätter des Bundesamts für Justiz dienen der Orientierung. Massgebend sind die gesetzlichen Bestimmungen und die Auskunft der zuständigen Behörden."
      },
      {
        question: "Welche Merkblätter sind für eine Hochzeit besonders wichtig?",
        answer:
          "Für die meisten Paare sind die Merkblätter zur Eheschliessung in der Schweiz, zur Eheschliessung im Ausland, zu Rechten und Pflichten sowie zur Namensführung relevant."
      },
      {
        question: "Wo finde ich weitere Sprachen?",
        answer:
          "Das Bundesamt für Justiz stellt auf seiner Merkblatt-Seite auch einzelne Merkblätter in weiteren Sprachen bereit, insbesondere zum Thema Ehe in der Schweiz: Rechte und Pflichten."
      }
    ]
  },
  {
    title: "Offiziell: Heiraten in der Schweiz",
    slug: "heiraten-schweiz-offizielle-informationen",
    excerpt: "Die wichtigsten offiziellen Informationen von ch.ch zu Voraussetzungen, Ehevorbereitung, Trauung, Kosten, Namenswahl und Heirat im Ausland.",
    sourceName: "ch.ch - Eine Dienstleistung des Bundes, der Kantone und Gemeinden",
    sourceUrl: "https://www.ch.ch/de/familie-und-partnerschaft/heirat--konkubinat--partenariat/heiraten/",
    sourceDescription:
      "Zusammenfassung auf Basis der offiziellen Informationsseite von ch.ch. Verbindliche Auskünfte erteilt immer das zuständige Zivilstandsamt oder die zuständige Behörde.",
    content: [
      "Wer in der Schweiz heiraten möchte, muss bestimmte Voraussetzungen erfüllen und beim Zivilstandsamt ein Gesuch einreichen. Das Amt erklärt, welche Schritte und Unterlagen für die konkrete Situation nötig sind.",
      "Grundsaetzlich müssen beide Personen volljaehrig und urteilsfaehig sein. Sie duerfen nicht bereits verheiratet sein oder in einer eingetragenen Partnerschaft leben. Zudem darf keine verbotene nahe Verwandtschaft bestehen.",
      "Nach der Prüfung der Unterlagen wird beim Zivilstandsamt oder bei der Schweizer Vertretung im Ausland die Erklärung betreffend die Voraussetzungen für die Eheschliessung ausgefüllt und unterschrieben.",
      "Wenn alle Formalitäten erledigt sind und das Amt bestätigt, dass die Ehe geschlossen werden kann, bleibt für die zivile Trauung ein Zeitfenster von drei Monaten. Die Trauung kann beim Zivilstandsamt am Wohnort oder bei einem anderen Zivilstandsamt in der Schweiz stattfinden.",
      "Bei der zivilen Trauung müssen zwei volljaehrige und urteilsfaehige Trauzeuginnen oder Trauzeugen anwesend sein. Nach der Trauung erhalten die Ehegatten eine Eheurkunde.",
      "Die Kosten für Dokumente und zivile Trauung liegen laut ch.ch in der Regel schweizweit bei rund 300 bis 400 Franken. Besondere Wünsche, zum Beispiel eine Trauung am Samstag, können zusätzliche Kosten verursachen.",
      "Beim Namen können Ehegatten ihren bisherigen Namen behalten oder den Ledignamen einer Person als gemeinsamen Familiennamen wählen. Allianznamen mit Bindestrich können im Alltag verwendet werden, werden aber nicht ins Zivilstandsregister eingetragen.",
      "Nach der Heirat müssen neuer Zivilstand und ein allfälliger Namenswechsel verschiedenen Stellen gemeldet werden, etwa Gemeinde, Steuerverwaltung, Arbeitgeber, Bank, Post und Versicherungen. Bei Namensänderung müssen auch Ausweise und Karten angepasst werden.",
      "Eine Heirat mit einer Schweizer Bürgerin oder einem Schweizer Bürger führt nicht automatisch zum Schweizer Bürgerrecht. Je nach Situation kann aber ein vereinfachtes Einbürgerungsverfahren möglich sein.",
      "Wer im Ausland heiraten möchte, sollte frühzeitig mit den ausländischen Behörden, der Schweizer Vertretung und gegebenenfalls der Migrationsbehoerde klären, welche Dokumente und Anerkennungsschritte nötig sind."
    ],
    faq: [
      {
        question: "Woher stammen diese Informationen?",
        answer:
          "Die Zusammenfassung basiert auf der offiziellen Seite ch.ch zum Thema Heirat. ch.ch ist eine Dienstleistung des Bundes, der Kantone und Gemeinden."
      },
      {
        question: "Sind die Angaben verbindlich?",
        answer:
          "Die Informationen dienen der Orientierung. Verbindlich ist immer die Auskunft des zuständigen Zivilstandsamts oder der zuständigen Behörde."
      },
      {
        question: "Wie lange habe ich nach der Ehevorbereitung Zeit für die Trauung?",
        answer:
          "Nach der Bestaetigung des Zivilstandsamts, dass die Ehe geschlossen werden kann, bleibt gemaess ch.ch ein Zeitfenster von drei Monaten."
      }
    ]
  },
  {
    title: "Heiraten in der Schweiz: Ablauf Schritt für Schritt",
    slug: "heiraten-schweiz-ablauf",
    excerpt: "Von der ersten Abklärung bis zur Ziviltrauung: die wichtigsten Schritte für Paare in der Schweiz.",
    content: [
      "Prüfe zuerst, welches Zivilstandsamt für deinen Wohnort oder Wunschort zuständig ist.",
      "Reiche die benötigten Dokumente ein und starte die Ehevorbereitung. Das Amt prüft, ob die gesetzlichen Voraussetzungen erfüllt sind.",
      "Nach Abschluss der Vorbereitung könnt ihr den Termin für die Ziviltrauung verbindlich planen."
    ],
    faq: [
      {
        question: "Wie früh sollte ich das Zivilstandsamt kontaktieren?",
        answer: "Viele Paare starten drei bis sechs Monate vorher. Bei ausländischen Dokumenten lohnt sich eine frühere Abklärung."
      },
      {
        question: "Ist die freie Trauung rechtsgültig?",
        answer: "Nein. Rechtsgültig ist in der Schweiz die Ziviltrauung beim zuständigen Zivilstandsamt."
      }
    ]
  },
  {
    title: "Welche Dokumente brauche ich für die standesamtliche Hochzeit?",
    slug: "dokumente-standesamtliche-hochzeit",
    excerpt: "Die wichtigsten Unterlagen und warum die definitive Liste immer vom Amt bestätigt werden muss.",
    content: [
      "Typische Unterlagen sind ein gültiger Ausweis, Wohnsitzbest?tigungen und Dokumente zum aktuellen Zivilstand.",
      "Bei ausländischen Urkunden können Beglaubigungen, Apostillen oder Übersetzungen verlangt werden.",
      "Die konkrete Liste hängt von Nationalität, Wohnsitz, Zivilstand und persönlicher Situation ab."
    ],
    faq: [
      {
        question: "Kann ich Dokumente digital einreichen?",
        answer: "Einige Ämter bieten digitale Schritte an. Ob Originale nötig sind, entscheidet das zuständige Amt."
      }
    ]
  }
];

export const vendors: Vendor[] = [
  {
    companyName: "Atelier Lumiere Hochzeitfotografie",
    slug: "atelier-lumiere",
    category: "fotograf",
    region: "Zürich und Ostschweiz",
    cantonSlug: "zuerich",
    shortDescription: "Ruhige, dokumentarische Hochzeitsfotografie für standesamtliche Trauungen und kleine Feiern.",
    websiteUrl: "https://example.com",
    priceRange: "CHF 900-2400",
    languages: ["Deutsch", "Englisch"],
    styleTags: ["modern", "elegant", "small wedding"],
    featured: true
  },
  {
    companyName: "Maison Blume",
    slug: "maison-blume",
    category: "florist",
    region: "Basel",
    cantonSlug: "basel-stadt",
    shortDescription: "Saisonale Brautsträusse und florale Konzepte für dezente, stilvolle Ziviltrauungen.",
    websiteUrl: "https://example.com",
    priceRange: "CHF 250-1800",
    languages: ["Deutsch", "Französisch"],
    styleTags: ["classic", "modern", "elegant"],
    featured: false
  }
];

export function getCanton(slug: string) {
  return cantons.find((canton) => canton.slug === slug);
}

export function getCity(slug: string) {
  return cities.find((city) => city.slug === slug);
}

export function getOffice(slug: string) {
  return registryOffices.find((office) => office.slug === slug);
}

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function getVendor(category: string, slug: string) {
  return vendors.find((vendor) => vendor.category === category && vendor.slug === slug);
}
