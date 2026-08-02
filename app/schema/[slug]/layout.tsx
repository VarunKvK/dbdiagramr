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

export default function SchemaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
