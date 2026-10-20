import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Check, X } from "lucide-react";
import Footer from "@/app/sections/Footer";
import RlsDemo from "@/components/RlsDemo";
import TrackedLink from "@/components/TrackedLink";
import { RLS_META } from "@/lib/rls";
import FaqAccordion from "@/app/sections/FaqAccordion";

const URL = "https://www.dbdiagramr.space/supabase-rls-check";
const TITLE = "Supabase RLS Check — Find Tables Without Row Level Security";
const DESCRIPTION =
  "See which Supabase tables have Row Level Security off, on with no policies, or protected. Read-only, no signup, connection string never stored.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "supabase rls check",
    "supabase row level security",
    "row level security checker",
    "supabase rls disabled",
    "postgres rls audit",
    "supabase security check",
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: URL,
    images: [{ url: "/DbDiagramr-OG.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/DbDiagramr-OG.png"],
  },
};

const faqs = [
  {
    q: "What does RLS disabled mean?",
    a: "It means Row Level Security is not enabled on that table. That is a risk signal, not proof that the data is public: access also depends on table grants and whether the table is exposed through your API. Check both the flag and the grants.",
  },
  {
    q: "What if RLS is on but there are no policies?",
    a: "RLS is enabled with zero policies, so non-owners are denied by default. That can be intentional, or it can break an app that expected access. Confirm which one you meant.",
  },
  {
    q: "Does this work with Supabase?",
    a: "Yes. Use the Session pooler (port 5432) or Transaction pooler (port 6543) connection string. Direct connections are IPv6-only and often fail from hosted apps.",
  },
  {
    q: "Do you store my connection string or schema?",
    a: "No. The connection string is sent to our backend for one request, then discarded. We read catalog metadata only, never table rows. Nothing is saved.",
  },
  {
    q: "Which schemas do you check?",
    a: "public, auth and storage. public is shown first, and you can switch auth or storage on with one click. Everything else is ignored so the diagram stays readable.",
  },
  {
    q: "Why does pasted SQL show RLS as unknown?",
    a: "A CREATE TABLE script usually does not contain enough information to know whether RLS is enabled or how many policies exist. Connect live to read the real flags from PostgreSQL.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const legend = [
  {
    icon: AlertTriangle,
    color: RLS_META.disabled.color,
    title: "RLS off",
    body: "The table has no Row Level Security. Check grants and API exposure.",
  },
  {
    icon: AlertTriangle,
    color: RLS_META["no-policies"].color,
    title: "RLS on, no policies",
    body: "Non-owners are denied by default. Confirm that is intentional.",
  },
  {
    icon: Check,
    color: RLS_META.protected.color,
    title: "RLS on",
    body: "At least one policy exists. Review the policy logic separately.",
  },
  {
    icon: X,
    color: RLS_META.unknown.color,
    title: "RLS unknown",
    body: "Pasted SQL cannot show RLS. Connect live to read the flags.",
  },
];

export default function SupabaseRlsCheckPage() {
  return (
    <main className="min-h-screen bg-cream pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 lg:px-8 md:pt-24">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
          Free Supabase security check
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
          See which tables have{" "}
          <span className="text-accent">Row Level Security off.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Connect with a read-only role. dbdiagramr reads the RLS flags and
          policy counts from PostgreSQL, draws your public schema (auth and
          storage are one click away), and marks every table. No signup, no
          storage.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <TrackedLink
            href="/visualize"
            event="cta_clicked"
            params={{ location: "rls_hero" }}
            className="rounded-[10px] bg-accent px-6 py-2.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Check my database
          </TrackedLink>
          <a
            href="#demo"
            className="rounded-[10px] border border-accent px-6 py-2.5 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
          >
            See the demo
          </a>
        </div>
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
          Public schema only today. RLS off is a risk signal, not proof that
          data is public — check grants too.
        </p>
      </section>

      <section id="demo" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-16 lg:px-8">
        <RlsDemo />
        <p className="mt-3 text-center font-mono text-[11px] text-muted">
          Example schema. Hover a table to see its RLS status. Live connections
          show your real flags.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          What the badges mean
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {legend.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[16px] border border-border bg-surface p-5"
              >
                <Icon size={18} style={{ color: item.color }} />
                <h3 className="mt-3 text-sm font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
        <div className="grid gap-8 rounded-[20px] border border-border bg-surface p-8 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Run it with a read-only role
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Metadata lives in PostgreSQL system catalogs, so the role only
              needs CONNECT and USAGE. It does not need SELECT on your tables.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-[10px] border border-border bg-white p-4 font-mono text-[11px] leading-relaxed text-ink">{`CREATE ROLE dbdiagramr_reader LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE your_db TO dbdiagramr_reader;
GRANT USAGE ON SCHEMA public TO dbdiagramr_reader;`}</pre>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
              Use the Session pooler (5432) or Transaction pooler (6543)
              connection string from Supabase → Connect.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              What we read
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              <li>· Table and column names, types, keys and foreign keys.</li>
              <li>· The RLS flag and the number of policies per table.</li>
              <li>· Never row data, policy expressions or secrets.</li>
              <li>· The connection string is used once, then discarded.</li>
              <li>· TLS certificates are always verified.</li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Prefer to keep everything in the browser?{" "}
              <Link
                href="/database-schema-analyzer"
                className="font-medium text-accent hover:text-accent-hover"
              >
                Paste SQL into the schema analyzer
              </Link>
              . It cannot see RLS, but it catches missing keys and unindexed
              foreign keys.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Questions
        </h2>
        <div className="mt-6 overflow-hidden rounded-[16px] border border-border bg-surface">
          <FaqAccordion items={faqs} variant="flush" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">
        <div className="rounded-[20px] bg-ink px-6 py-10 text-center text-white md:px-12">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Check your schema in 10 seconds.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
            See every table, its foreign keys, and whether RLS is on. Free, no
            account, nothing stored.
          </p>
          <TrackedLink
            href="/visualize"
            event="cta_clicked"
            params={{ location: "rls_footer" }}
            className="mt-6 inline-block rounded-[10px] bg-punch px-6 py-2.5 text-xs font-medium text-ink transition-colors hover:bg-white"
          >
            Run the RLS check
          </TrackedLink>
        </div>
      </section>

      <Footer />
    </main>
  );
}
