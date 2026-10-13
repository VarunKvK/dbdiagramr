import type { Metadata } from "next";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import ConnStringBuilder from "@/components/ConnStringBuilder";

const URL = "https://www.dbdiagramr.space/postgres-connection-string";
const TITLE = "PostgreSQL Connection String Builder & Parser | dbdiagramr";
const DESCRIPTION =
  "Build or decode a PostgreSQL connection URI, with presets for Supabase, Neon, and Railway plus SSL options. Runs entirely in your browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "postgres connection string, postgresql connection url format, postgresql connection string builder, connection string parser, supabase connection string",
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
    q: "What is the format of a PostgreSQL connection string?",
    a: "postgresql://user:password@host:port/dbname?sslmode=require. The user and password are percent-encoded when they contain special characters, port defaults to 5432, and query parameters carry options like sslmode, connect_timeout, and application_name.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Build URIs from parts or decode pasted URIs, presets cover Supabase pooler and direct, Neon, Railway, and localhost.",
  },
  {
    q: "Is my password uploaded anywhere?",
    a: "No. Building and parsing run entirely in your browser. Nothing is sent to a server, and when you open the result in dbdiagramr, the connection string travels via sessionStorage, never via URL parameters or server logs.",
  },
  {
    q: "Which providers are supported?",
    a: "Any PostgreSQL URI parses, and presets prefill Supabase (Session pooler 5432 and Direct), Neon (pooled host, sslmode=require), Railway, and localhost. Transaction poolers (Supabase 6543) decode fine but cannot run schema introspection, use Session mode for visualization.",
  },
  {
    q: "Can I visualize the database this connects to?",
    a: "Yes. Click Open in dbdiagramr to hand the connection string to the visualizer securely (sessionStorage, not URL params) and get an interactive ER diagram of the live schema.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "PostgreSQL Connection String Builder",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function ConnStringPage() {
  return (
    <ToolPageShell
      appName="PostgreSQL Connection String Builder"
      h1="PostgreSQL connection string builder"
      intro="Build a PostgreSQL connection URI from parts, or paste one to decode every field. Presets for Supabase, Neon, and Railway. Passwords never leave your browser."
      current="/postgres-connection-string"
      siblings={["/postgres-er-diagram", "/visualize"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/postgres-er-diagram", label: "PostgreSQL ER Diagram Tool" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ConnStringBuilder />
    </ToolPageShell>
  );
}
