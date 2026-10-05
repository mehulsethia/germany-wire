import type { Article } from "./types";

// Demo content shown only when Supabase is not configured. Not real news.
const day = (n: number) => new Date(Date.now() - n * 864e5).toISOString();
const ahead = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

const base = { fetched_at: day(0) };

export const SAMPLE_ARTICLES: Article[] = [
  {
    ...base, id: "s1", source_name: "BAMF", source_url: "https://www.bamf.de",
    title_de: "Neue Regelungen zur Verlängerung von Aufenthaltstiteln",
    title_en: "Residence permit renewals: apply earlier than before",
    summary_en: "Immigration offices are asking people to start residence permit (Aufenthaltstitel) renewals sooner, because processing times have grown. Book your appointment as soon as your permit is within a few months of expiry.",
    category: "immigration", relevance_score: 94, published_at: day(0), is_time_sensitive: true, deadline_date: ahead(21),
  },
  {
    ...base, id: "s2", source_name: "Bundesregierung", source_url: "https://www.bundesregierung.de",
    title_de: "Kabinett beschließt Entlastungen bei der Einkommensteuer",
    title_en: "Cabinet agrees income tax relief for 2027",
    summary_en: "The government plans to raise the tax-free allowance and adjust the income tax brackets. Most employees should see a little more in their monthly net salary once the law passes.",
    category: "taxes", relevance_score: 88, published_at: day(1), is_time_sensitive: true, deadline_date: ahead(87),
  },
  {
    ...base, id: "s3", source_name: "Bundestag DIP", source_url: "https://dip.bundestag.de",
    title_de: "Gesetz zur Modernisierung des Staatsangehörigkeitsrechts: Beratung im Ausschuss",
    title_en: "Citizenship law changes move through committee",
    summary_en: "Lawmakers are discussing updates to how and when people can apply for German citizenship. Nothing changes yet, but it is worth checking the final conditions before you plan an application.",
    category: "new-laws", relevance_score: 82, published_at: day(2), is_time_sensitive: false, deadline_date: null,
  },
  {
    ...base, id: "s4", source_name: "Tagesschau", source_url: "https://www.tagesschau.de",
    title_de: "Krankenkassen erhöhen Zusatzbeiträge",
    title_en: "Health insurers raise their extra contribution",
    summary_en: "Several statutory health insurers (Krankenkassen) are raising their additional contribution rate. If your insurer is one of them, you usually have a special right to switch providers.",
    category: "healthcare", relevance_score: 79, published_at: day(2), is_time_sensitive: true, deadline_date: ahead(34),
  },
  {
    ...base, id: "s5", source_name: "Tagesschau", source_url: "https://www.tagesschau.de",
    title_de: "Deutschlandticket bleibt – Preis steigt moderat",
    title_en: "Deutschlandticket stays, with a modest price rise",
    summary_en: "The monthly nationwide public transport ticket will continue. The monthly price goes up a little from the start of next year, and existing subscriptions adjust automatically.",
    category: "transport", relevance_score: 71, published_at: day(3), is_time_sensitive: false, deadline_date: null,
  },
  {
    ...base, id: "s6", source_name: "Bundesregierung", source_url: "https://www.bundesregierung.de",
    title_de: "Fachkräfteeinwanderung: Verfahren werden digitalisiert",
    title_en: "Skilled-worker visa applications are going digital",
    summary_en: "A new online portal is meant to speed up visa and recognition procedures for skilled workers. Employers and applicants can upload documents in one place instead of sending paper.",
    category: "jobs", relevance_score: 85, published_at: day(4), is_time_sensitive: false, deadline_date: null,
  },
  {
    ...base, id: "s7", source_name: "Tagesschau", source_url: "https://www.tagesschau.de",
    title_de: "Kindergeld: Auszahlung wird vereinfacht",
    title_en: "Child benefit payouts get simpler",
    summary_en: "Families will be able to manage Kindergeld applications online with fewer documents. Parents who already receive it do not need to do anything.",
    category: "family", relevance_score: 66, published_at: day(5), is_time_sensitive: false, deadline_date: null,
  },
  {
    ...base, id: "s8", source_name: "Tagesschau", source_url: "https://www.tagesschau.de",
    title_de: "Mieten steigen in Großstädten weiter",
    title_en: "Rents keep climbing in big cities",
    summary_en: "New figures show rents for new contracts rose again in major cities. If you are flat-hunting, expect competition and have your documents (Schufa, payslips) ready.",
    category: "housing", relevance_score: 58, published_at: day(6), is_time_sensitive: false, deadline_date: null,
  },
];
