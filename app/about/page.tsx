import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import { AUTHOR } from "@/data/authors";
import {
  breadcrumbNode,
  personNode,
  PERSON_ID,
  SITE_URL,
} from "@/lib/structuredData";

const URL = `${SITE_URL}/about`;
const TITLE = "About Varun Krishnan and dbdiagramr";
const DESCRIPTION =
  "Who builds dbdiagramr, why it exists, how it is built, and how your schema data is handled.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: AUTHOR.name, url: URL }],
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
      "@type": "ProfilePage",
      "@id": `${URL}#page`,
      url: URL,
      name: TITLE,
      description: DESCRIPTION,
      mainEntity: { "@id": PERSON_ID },
    },
    personNode(),
    breadcrumbNode([
      { name: "Home", url: SITE_URL },
      { name: "About", url: URL },
    ]),
  ],
};

const builtWith = [
  {
    label: "Next.js 14 and TypeScript",
    detail: "The app and every page are typed and server-rendered where it matters.",
  },
  {
    label: "React Flow and dagre",
    detail: "The diagram is interactive, and the layout is calculated from the schema.",
  },
  {
    label: "PostgreSQL system catalogs",
    detail: "Live connections read schema metadata from pg_catalog, never table rows.",
  },
  {
    label: "Browser-side SQL parsing",
    detail: "Paste-SQL mode runs in your browser and does not upload your SQL.",
  },
];

const contactLinks = [
  {
    label: "GitHub",
    href: "https://github.com/VarunKvK",
    detail: "Code and projects",
  },
  {
    label: "dev.to",
    href: "https://dev.to/not_varunkv",
    detail: "Longer write-ups",
  },
  {
    label: "Project issues",
    href: "https://github.com/VarunKvK/dbdiagramr/issues",
    detail: "Bugs and feature requests",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-24 lg:px-8">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
          About
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
          A clear view of your database, for{" "}
          <span className="text-accent">everyone.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          dbdiagramr is a free, open-source tool that turns a PostgreSQL schema
          into an interactive ER diagram. It is built and maintained by Varun
          Krishnan.
        </p>

        <section className="mt-14 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[20px] bg-ink p-8 text-white">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-punch font-mono text-lg font-semibold text-ink">
                VK
              </span>
              <div>
                <h2 className="text-2xl font-semibold">{AUTHOR.name}</h2>
                <p className="mt-1 text-sm font-medium text-white/60">
                  {AUTHOR.role}
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-white/70">
              {AUTHOR.bio} The goal is simple: make a database understandable
              in the time it takes to paste a connection string or a schema.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://github.com/VarunKvK"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[10px] bg-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
              >
                GitHub
              </a>
              <a
                href="https://dev.to/not_varunkv"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[10px] border border-white/30 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
              >
                dev.to
              </a>
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-surface p-8">
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Why it exists
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Most diagram tools ask you to draw tables by hand, write DBML, or
              install a client. The schema already exists in PostgreSQL. You
              should be able to see it without rebuilding it.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              dbdiagramr reads the real schema, or parses SQL in your browser,
              and draws the tables and foreign keys immediately. Reconnect
              after a migration and the diagram reflects the current database.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <Link
                href="/visualize"
                className="font-medium text-accent hover:text-accent-hover"
              >
                Try the tool →
              </Link>
              <Link
                href="/pricing"
                className="font-medium text-accent hover:text-accent-hover"
              >
                Pricing →
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            How it is built
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {builtWith.map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border border-border bg-white p-5"
              >
                <h3 className="text-sm font-semibold text-ink">{item.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            The source is on{" "}
            <a
              href="https://github.com/VarunKvK/dbdiagramr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:text-accent-hover"
            >
              GitHub
            </a>{" "}
            under the MIT license, so you can self-host it.
          </p>
        </section>

        <section className="mt-14 rounded-[20px] border border-border bg-white p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Privacy model
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
            <li>
              Paste SQL is parsed in your browser. The SQL never leaves the
              page.
            </li>
            <li>
              A live connection string is sent to the dbdiagramr backend, used
              for one request, then discarded.
            </li>
            <li>
              Connection strings, schemas, and row data are not stored. Live
              connections read metadata only.
            </li>
            <li>
              TLS certificates are always verified. Share links embed the
              diagram in the URL; they are not saved on the server.
            </li>
            <li>
              Analytics can be disabled for your browser with{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs text-ink">
                ?notrack=1
              </code>
              .
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Contact
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Found a bug, a schema that looks wrong, or a tool you want next?
            Open an issue or send a message.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {contactLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[16px] border border-border bg-surface p-5 transition-colors hover:border-accent hover:bg-accent-soft"
              >
                <span className="text-sm font-semibold text-ink">
                  {link.label}
                </span>
                <span className="mt-1 block text-sm text-muted">
                  {link.detail}
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <Image
            src="/db-logo.svg"
            alt="dbdiagramr logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <p className="text-sm text-muted">
            Free, open source, and built for PostgreSQL.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
