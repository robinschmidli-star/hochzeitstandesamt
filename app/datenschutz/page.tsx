import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Datenschutz",
  description: "Datenschutzerklärung für hochzeitstandesamt.ch.",
  path: "/datenschutz"
});

const sections = [
  {
    title: "1. Allgemeine Hinweise",
    paragraphs: [
      "Diese Datenschutzerklärung informiert Sie darüber, welche personenbezogenen Daten auf dieser Website erhoben, verarbeitet und genutzt werden.",
      "Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften der Schweiz, insbesondere dem revidierten Datenschutzgesetz (DSG)."
    ]
  },
  {
    title: "2. Verantwortliche Stelle",
    paragraphs: ["RS Schmidli Consulting, Stockenerstrasse 23, 8405 Winterthur, Schweiz", "E-Mail: kontakt@hochzeitstandesamt.ch"]
  },
  {
    title: "3. Welche Daten wir erfassen",
    paragraphs: [
      "Wenn Sie unsere Suchfunktion oder Formulare nutzen, können wir insbesondere Vorname, E-Mail-Adresse, Wohn- oder Wunschort, Hochzeitsdatum, Angaben zu Ihrer Suche oder Anbieterwünschen, Inhalte Ihrer Nachricht sowie weitere freiwillig eingegebene Informationen erfassen.",
      "Beim Besuch der Website können automatisch technische Daten erhoben werden, insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, Browsertyp, Browserversion, Betriebssystem, Referrer-URL, Geräteinformationen und Nutzungsverhalten auf der Website.",
      "Wenn Sie Formularfelder mittels Browser- oder Google-Autofill ausfüllen, können die eingegebenen Daten beim Absenden des Formulars gespeichert werden."
    ]
  },
  {
    title: "4. Zweck der Datenbearbeitung",
    paragraphs: [
      "Wir bearbeiten personenbezogene Daten insbesondere zur Bereitstellung und zum Betrieb der Website, zur Bearbeitung von Anfragen, zum Speichern von Suchen und zur Zusendung angeforderter Informationen, zur Verbesserung unserer Dienstleistungen, zur Analyse der Nutzung der Website, zur Missbrauchs- und Sicherheitsprävention sowie für Marketing- und Kommunikationszwecke, sofern Sie darin eingewilligt haben."
    ]
  },
  {
    title: "5. Rechtsgrundlagen",
    paragraphs: [
      "Die Bearbeitung personenbezogener Daten erfolgt gestützt auf Ihre Einwilligung, die Durchführung vorvertraglicher Massnahmen, berechtigte Interessen am Betrieb und der Verbesserung der Website sowie gesetzliche Verpflichtungen."
    ]
  },
  {
    title: "6. Cookies und ähnliche Technologien",
    paragraphs: [
      "Unsere Website kann Cookies und ähnliche Technologien verwenden. Cookies dienen insbesondere dazu, die Benutzerfreundlichkeit zu verbessern, Funktionen der Website bereitzustellen, Besucherstatistiken zu analysieren und Marketingmassnahmen zu unterstützen.",
      "Sie können Cookies jederzeit über Ihre Browsereinstellungen einschränken oder deaktivieren."
    ]
  },
  {
    title: "7. Google-Dienste",
    paragraphs: [
      "Unsere Website kann Dienste von Google verwenden, insbesondere Google Analytics, Google Fonts, Google Maps, Google Autofill / Google Places API, Google Ads oder Remarketing. Dabei können Daten an Server von Google übertragen werden.",
      "Weitere Informationen finden Sie unter https://policies.google.com/privacy."
    ]
  },
  {
    title: "8. Speicherung und Aufbewahrung",
    paragraphs: ["Personenbezogene Daten werden nur so lange gespeichert, wie dies für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen."]
  },
  {
    title: "9. Datensicherheit",
    paragraphs: [
      "Wir treffen angemessene technische und organisatorische Sicherheitsmassnahmen zum Schutz Ihrer Daten. Trotz sorgfältiger Sicherheitsmassnahmen kann eine absolute Sicherheit bei der Datenübertragung im Internet nicht garantiert werden."
    ]
  },
  {
    title: "10. Weitergabe an Dritte",
    paragraphs: [
      "Eine Weitergabe personenbezogener Daten an Dritte erfolgt nur, wenn dies zur Vertragserfüllung erforderlich ist, wenn Sie eingewilligt haben, wenn wir gesetzlich dazu verpflichtet sind oder soweit technische Dienstleister wie Hosting-, Analyse- oder CRM-Anbieter für uns tätig sind."
    ]
  },
  {
    title: "11. Hosting und Drittanbieter",
    paragraphs: [
      "Unsere Website wird über Vercel bereitgestellt. Dabei können technische Verbindungsdaten durch Vercel verarbeitet werden. Anfragen und Nutzungsdaten werden in der für diese Website konfigurierten PostgreSQL-Datenbank gespeichert. Die jeweils eingesetzten Anbieter werden vertraglich und technisch so eingebunden, dass ein angemessenes Datenschutzniveau gewährleistet wird."
    ]
  },
  {
    title: "12. Ihre Rechte",
    paragraphs: [
      "Sie haben im Rahmen des anwendbaren Datenschutzrechts insbesondere das Recht auf Auskunft über gespeicherte Daten, Berichtigung unrichtiger Daten, Löschung personenbezogener Daten, Einschränkung der Bearbeitung, Widerspruch gegen bestimmte Datenbearbeitungen sowie Widerruf einer Einwilligung.",
      "Anfragen können an die oben genannte Kontaktadresse gerichtet werden."
    ]
  },
  {
    title: "13. Änderungen dieser Datenschutzerklärung",
    paragraphs: ["Wir behalten uns vor, diese Datenschutzerklärung jederzeit anzupassen. Es gilt jeweils die auf dieser Website veröffentlichte aktuelle Version."]
  },
  {
    title: "14. Kontakt",
    paragraphs: ["Bei Fragen zum Datenschutz können Sie uns jederzeit kontaktieren: kontakt@hochzeitstandesamt.ch"]
  }
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-champagne">Datenschutz</p>
      <h1 className="mt-2 text-4xl font-semibold text-ink">Datenschutzerklärung</h1>
      <div className="mt-8 grid gap-4">
        {sections.map((section) => (
          <section key={section.title} className="rounded-xl border border-linen bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
            <div className="mt-3 grid gap-3 leading-7 text-soft-ink">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
