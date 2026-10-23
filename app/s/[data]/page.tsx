import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SchemaDiagram from "@/components/SchemaDiagram";
import { decodeSchema } from "@/lib/share";

export const runtime = "nodejs";

const SITE = "https://www.dbdiagramr.space";

export async function generateMetadata({
  params,
}: {
  params: { data: string };
}): Promise<Metadata> {
  const schema = await decodeSchema(params.data);
  const url = `${SITE}/s/${params.data}`;
  const fallbackImage = `${SITE}/DbDiagramr-OG.png`;

  if (!schema) {
    const title = "Diagram not found | dbdiagramr";
    const description = "This shared diagram link is invalid or has expired.";
    return {
      title,
      description,
      robots: { index: false, follow: true },
      alternates: { canonical: null },
      openGraph: {
        title,
        description,
        type: "website",
        url,
        images: [
          {
            url: fallbackImage,
            width: 1200,
            height: 630,
            alt: "dbdiagramr PostgreSQL ER diagram",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [fallbackImage],
      },
    };
  }

  const tableCount = schema.tables.length;
  const title = `${tableCount}-table PostgreSQL schema | dbdiagramr`;
  const description = `Interactive ER diagram of ${tableCount} ${
    tableCount === 1 ? "table" : "tables"
  }, shared with dbdiagramr. Free, no signup.`;
  const image = `${SITE}/api/og?d=${encodeURIComponent(params.data)}`;

  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: null },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SharedSchemaPage({
  params,
}: {
  params: { data: string };
}) {
  const schema = await decodeSchema(params.data);
  if (!schema) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/90 px-4 py-3 backdrop-blur">
        <Link href="/" className="font-mono text-sm font-semibold text-ink">
          dbdiagramr
        </Link>
        <Link
          href="/visualize"
          className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Create your own diagram
        </Link>
      </header>

      <main className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="h-[72vh] overflow-hidden rounded-[16px] border border-border bg-cream">
          <SchemaDiagram schema={schema} className="h-full w-full" />
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          Made with{" "}
          <Link href="/" className="font-medium text-ink underline-offset-2 hover:underline">
            dbdiagramr
          </Link>{" "}
          — free ER diagrams from SQL or a live database.
        </p>
      </main>
    </div>
  );
}
