import type { Metadata } from "next";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import PrismaErd from "@/components/PrismaErd";

const URL = "https://www.dbdiagramr.space/prisma-erd-generator";
const TITLE = "Prisma ERD Generator | Schema to ER Diagram | dbdiagramr";
const DESCRIPTION =
  "Paste your schema.prisma and see every model and relation as an interactive ER diagram. Free, instant, no signup, runs in your browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "prisma erd generator, prisma schema visualizer, prisma erd, schema.prisma diagram, prisma model diagram",
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    q: "How do I generate an ERD from Prisma without installing a generator?",
    a: "Paste your schema.prisma models into the box, no CLI, no generator block, no database connection. Models render as tables, scalar fields as columns, and @relation attributes as foreign-key lines, all in your browser.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Paste any size schema.prisma and explore the diagram instantly.",
  },
  {
    q: "Is my schema uploaded anywhere?",
    a: "No. Parsing and rendering run entirely in your browser with zero dependencies. Your schema is never uploaded, stored, or logged.",
  },
  {
    q: "Which Prisma features are supported?",
    a: "Model blocks with scalar, enum, optional, and list fields; @id, @unique, @default, @map, and @relation(fields, references); @@id, @@unique, and @@map table mappings. Relation-only fields render as edges, not columns, exactly like the database sees them.",
  },
  {
    q: "Can I get SQL or a fuller diagram from this?",
    a: "Yes. Copy as SQL exports the equivalent PostgreSQL DDL, and Open in dbdiagramr loads it into the full visualizer with search, export, and health analysis.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "Prisma ERD Generator",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function PrismaErdPage() {
  return (
    <ToolPageShell
      appName="Prisma ERD Generator"
      h1="Prisma schema to ER diagram"
      intro="Paste schema.prisma and see every model and relation as an interactive ER diagram, no generator to install, no database to connect, results live as you type."
      current="/prisma-erd-generator"
      siblings={["/sql-to-prisma", "/sql-to-typescript", "/postgres-er-diagram"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/schema/nextauth", label: "NextAuth schema diagram" },
        { href: "/blog/nextauth-auth-schema-explained", label: "NextAuth Schema Explained" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrismaErd />
    </ToolPageShell>
  );
}
