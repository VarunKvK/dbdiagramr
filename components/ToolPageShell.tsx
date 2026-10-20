import Link from "next/link";
import Footer from "@/app/sections/Footer";
import RelatedTools from "@/app/sections/RelatedTools";
import FaqAccordion from "@/app/sections/FaqAccordion";

export type ToolFaq = { q: string; a: string };

export type ToolJsonLd = {
  appName: string;
  appDescription: string;
  url: string;
  faqs: ToolFaq[];
};

export function buildToolJsonLd({
  appName,
  appDescription,
  url,
  faqs,
}: ToolJsonLd) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: appName,
        url,
        description: appDescription,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: {
          "@type": "Organization",
          name: "dbdiagramr",
          url: "https://www.dbdiagramr.space",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.dbdiagramr.space",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Free tools",
            item: "https://www.dbdiagramr.space/tools",
          },
          { "@type": "ListItem", position: 3, name: appName, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };
}

export default function ToolPageShell({
  appName,
  h1,
  intro,
  badge = "Free tool",
  current,
  siblings,
  faqs,
  exploreLinks,
  children,
}: {
  appName: string;
  h1: string;
  intro: string;
  badge?: string;
  current: string;
  siblings: string[];
  faqs: ToolFaq[];
  exploreLinks: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-cream" aria-label={appName}>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <Link
          href="/tools"
          className="mb-8 inline-flex items-center gap-1 font-mono text-xs font-medium text-accent transition-colors hover:text-accent-hover"
        >
          &larr; All tools
        </Link>

        <div className="mb-10">
          <span className="inline-block rounded-[20px] border border-accent bg-accent-soft px-3 py-1 font-mono text-xs font-medium text-accent">
            {badge}
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {h1}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            {intro}
          </p>
        </div>

        {children}

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <FaqAccordion items={faqs} variant="card" />
        </section>

        <RelatedTools current={current} siblings={siblings} />

        {exploreLinks.length > 0 && (
          <div className="mt-4 rounded-[20px] border border-border bg-white p-5 shadow-sm">
            <div className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
              Keep exploring
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {exploreLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Turn it into an ER diagram
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram of your own schema in under 10 seconds. No signup required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/visualize"
              className="inline-block rounded-[10px] bg-accent px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Try it free &rarr;
            </a>
            <a
              href="https://github.com/VarunKvK/dbdiagramr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-[10px] border border-white/40 px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              View on GitHub
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
