import type { Metadata } from "next";
import { breadcrumbNode, webApplicationNode } from "@/lib/structuredData";

const URL = "https://www.dbdiagramr.space/visualize";

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
  "@graph": [
    webApplicationNode({
      name: "dbdiagramr",
      description:
        "Generate interactive ER diagrams from any PostgreSQL database. Paste a connection string and see tables, columns, and foreign keys in under 10 seconds.",
      url: URL,
    }),
    breadcrumbNode([
      { name: "Home", url: "https://www.dbdiagramr.space" },
      { name: "Visualize", url: URL },
    ]),
  ],
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
