import type { Metadata } from "next";

export const metadata: Metadata = {
title: "Visualize Your PostgreSQL Schema",
  description:
    "Paste a PostgreSQL connection string and instantly generate an interactive ER diagram. Pan, zoom, hover to trace relationships, export as SVG or PNG.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.dbdiagramr.space/visualize",
  },
  openGraph: {
    title: "Visualize Your PostgreSQL Schema - ER Diagram Generator",
    description:
      "Paste a PostgreSQL connection string and get an interactive ER diagram in under 10 seconds. No signup, no setup.",
    type: "website",
    url: "https://www.dbdiagramr.space/visualize",
    images: [{ url: "/DbDiagramr-OG.png", width: 1200, height: 630 }],
  },
};

export default function VisualizeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
