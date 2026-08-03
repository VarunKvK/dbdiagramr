import type { Metadata } from "next";
import { getSchemaEntry } from "@/data/schemas/registry";

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const entry = getSchemaEntry(params.slug);
  if (!entry) return { title: "Schema not found" };

  return {
    title: entry.title,
    description: entry.description,
    keywords: entry.keywords,
    alternates: {
      canonical: `https://dbdiagramr.space/schema/${entry.slug}`,
    },
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: "website",
      url: `https://dbdiagramr.space/schema/${entry.slug}`,
      images: [{ url: "/DbDiagramr-OG.png", width: 1200, height: 630 }],
    },
  };
}

function jsonLdForEntry(entry: NonNullable<ReturnType<typeof getSchemaEntry>>) {
  const url = `https://dbdiagramr.space/schema/${entry.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: entry.h1,
        description: entry.description,
        datePublished: entry.lastUpdated,
        dateModified: entry.lastUpdated,
        mainEntityOfPage: url,
        publisher: {
          "@type": "Organization",
          name: "dbdiagramr",
          url: "https://dbdiagramr.space",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: entry.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://dbdiagramr.space",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Database Schema Diagrams",
            item: "https://dbdiagramr.space/schema",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: entry.name,
            item: url,
          },
        ],
      },
    ],
  };
}

export default function SchemaLayout({
  params,
  children,
}: Readonly<{
  params: { slug: string };
  children: React.ReactNode;
}>) {
  const entry = getSchemaEntry(params.slug);

  return (
    <>
      {entry && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdForEntry(entry)),
          }}
        />
      )}
      {children}
    </>
  );
}
