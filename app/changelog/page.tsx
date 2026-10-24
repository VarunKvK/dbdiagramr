import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import { changelogEntries } from "@/data/changelog";
import { formatDate, formatMonth, monthKey } from "@/lib/dates";
import { breadcrumbNode, SITE_URL } from "@/lib/structuredData";

const URL = `${SITE_URL}/changelog`;
const TITLE = "Changelog | dbdiagramr";
const DESCRIPTION =
  "Every meaningful user-facing change to dbdiagramr: new tools, schema diagrams, sharing, privacy changes, and performance work.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${URL}#page`,
      url: URL,
      name: TITLE,
      description: DESCRIPTION,
      dateModified: changelogEntries[0]?.date,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: changelogEntries.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${entry.date}: ${entry.title}`,
          url: `${URL}#${entry.date}`,
        })),
      },
    },
    breadcrumbNode([
      { name: "Home", url: SITE_URL },
      { name: "Changelog", url: URL },
    ]),
  ],
};

const groups = changelogEntries.reduce<
  { key: string; label: string; entries: typeof changelogEntries }[]
>((result, entry) => {
  const key = monthKey(entry.date);
  const current = result[result.length - 1];
  if (current?.key === key) {
    current.entries.push(entry);
    return result;
  }
  result.push({ key, label: formatMonth(entry.date), entries: [entry] });
  return result;
}, []);

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-24 lg:px-8">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
          Changelog
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
          What changed in <span className="text-accent">dbdiagramr.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          User-facing changes only: new tools, schema diagrams, sharing,
          privacy, and performance. This page is maintained with the product,
          not generated from commit messages.
        </p>

        <div className="mt-14 space-y-12">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="text-xl font-semibold tracking-tight text-ink">
                {group.label}
              </h2>
              <div className="mt-5 space-y-4">
                {group.entries.map((entry) => (
                  <article
                    key={entry.date}
                    id={entry.date}
                    className="scroll-mt-24 rounded-[20px] border border-border bg-white p-6 shadow-sm"
                  >
                    <time
                      dateTime={entry.date}
                      className="font-mono text-xs font-medium uppercase tracking-widest text-muted"
                    >
                      {formatDate(entry.date)}
                    </time>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                      {entry.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {entry.summary}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                      {entry.changes.map((change) => (
                        <li key={change} className="flex gap-2">
                          <span aria-hidden="true" className="text-accent">
                            ·
                          </span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-[20px] bg-ink px-8 py-10 text-center text-white">
          <h2 className="text-2xl font-semibold">See the current version</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/60">
            Open the tool or follow the project on GitHub.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/visualize"
              className="rounded-[10px] bg-accent px-6 py-2.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Try dbdiagramr
            </Link>
            <a
              href="https://github.com/VarunKvK/dbdiagramr"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[10px] border border-white/30 px-6 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
