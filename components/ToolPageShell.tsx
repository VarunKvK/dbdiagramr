import Link from "next/link";
import Footer from "@/app/sections/Footer";
import RelatedTools from "@/app/sections/RelatedTools";

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
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
        >
          &larr; All tools
        </Link>

        <div className="mb-10">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            {badge}
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            {h1}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            {intro}
          </p>
        </div>

        {children}

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-medium text-ink">
            Frequently asked questions
          </h2>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5"
              >
                <h3 className="text-lg font-medium text-ink">{faq.q}</h3>
                <p className="mt-2 leading-relaxed text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools current={current} siblings={siblings} />

        {exploreLinks.length > 0 && (
          <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="text-sm font-medium uppercase tracking-wider text-muted">
              Keep exploring
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {exploreLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        <section className="mt-16 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-medium text-white">
            Turn it into an ER diagram
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram of your own schema in under 10 seconds. No signup required.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-medium text-ink transition-colors hover:bg-indigo-100"
          >
            Try it free &rarr;
          </a>
        </section>
      </div>
      <Footer />
    </main>
  );
}
