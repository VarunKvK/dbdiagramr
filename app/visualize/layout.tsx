import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visualize Your PostgreSQL Schema — Free ER Diagram Generator",
  description:
    "Paste your PostgreSQL connection string and instantly generate an interactive ER diagram. Pan, zoom, and hover to trace relationships. Export as SVG or PNG. No signup required.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://dbdiagramr.space/visualize",
  },
  openGraph: {
    title: "Visualize Your PostgreSQL Schema — Free ER Diagram Generator",
    description:
      "Paste a PostgreSQL connection string and get an interactive ER diagram in under 10 seconds. No signup, no setup.",
    type: "website",
    url: "https://dbdiagramr.space/visualize",
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
