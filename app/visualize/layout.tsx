import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PostgreSQL ER Diagram Generator | Paste a Connection String",
  description:
    "Paste a PostgreSQL connection string and generate an interactive ER diagram. Trace foreign keys and export as SVG or PNG. No signup required.",
  keywords:
    "postgresql er diagram, postgres erd tool, database diagram online, er diagram generator, schema visualization",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.dbdiagramr.space/visualize",
  },
  openGraph: {
    title: "PostgreSQL ER Diagram Generator | Paste a Connection String",
    description:
      "Paste a PostgreSQL connection string and get an interactive ER diagram in under 10 seconds. No signup, no setup.",
    type: "website",
    url: "https://www.dbdiagramr.space/visualize",
    images: [{ url: "/DbDiagramr-OG.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "dbdiagramr",
  url: "https://www.dbdiagramr.space",
  description:
    "Generate interactive ER diagrams from any PostgreSQL database. Paste a connection string and see tables, columns, and foreign keys in under 10 seconds.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any (browser-based)",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Varun Krishnan",
    url: "https://github.com/VarunKvK",
  },
};

export default function VisualizeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
