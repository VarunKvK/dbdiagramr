export type ChangelogEntry = {
  date: string;
  title: string;
  summary: string;
  changes: string[];
};

export const changelogEntries: ChangelogEntry[] = [
  {
    date: "2026-10-24",
    title: "Faster page loads on mobile",
    summary:
      "The site ships less JavaScript, loads the important content sooner, and is easier to use with a keyboard or screen reader.",
    changes: [
      "Faster loads on mobile and slower connections",
      "Fixed contrast and heading-order accessibility issues",
    ],
  },
  {
    date: "2026-10-23",
    title: "Corrected Supabase connection guidance",
    summary:
      "Schema pages and guides now use verified facts, clearer source notes, and safer share links.",
    changes: [
      "Corrected Supabase, competitor, and RLS wording",
      "Safer limits on shared diagram links",
    ],
  },
  {
    date: "2026-10-21",
    title: "Refreshed guides and easier reading",
    summary:
      "Guide pages now use FAQ accordions and smoother scrolling so long explanations are easier to scan.",
    changes: [
      "FAQ accordions on guide pages",
      "Smoother page scrolling",
    ],
  },
  {
    date: "2026-10-20",
    title: "Share a preview of your diagram",
    summary:
      "Share links now show a preview of the diagram when posted on X or LinkedIn, and new schema pages are available.",
    changes: [
      "Public share links show your diagram on X and LinkedIn",
      "Added Better Auth, ChartDB, and Supabase schema pages",
      "Private share links with safe size limits",
    ],
  },
  {
    date: "2026-10-19",
    title: "Honest pricing and a free Supabase RLS check",
    summary:
      "Pricing now says plainly that Pro is still in development, and the free RLS check shows which tables need attention.",
    changes: [
      "Pricing page states that Pro is in development",
      "Free RLS check shows RLS off, no policies, or policies to review",
      "Safer live connections with verified TLS",
    ],
  },
  {
    date: "2026-10-13",
    title: "Refreshed tool pages and a PR schema diff Action",
    summary:
      "The tool family got a clearer layout, and the GitHub Action now comments schema diffs on pull requests.",
    changes: [
      "New tool-family layout and styling",
      "GitHub Action comments schema diffs, migration previews, and Mermaid ERDs on pull requests",
    ],
  },
  {
    date: "2026-10-10",
    title: "More free converters",
    summary:
      "Added more ways to turn SQL, CSV, and JSON into the format you need.",
    changes: [
      "CSV to SQL, JSON to SQL, SQL to Mermaid, SQL to TypeScript, and SQL to Prisma",
      "SQL validator and schema diff",
    ],
  },
  {
    date: "2026-10-05",
    title: "More schema and tool guides",
    summary:
      "Published new guides on schema health, SQL formatting, and choosing a diagram tool.",
    changes: [
      "New schema health and SQL formatting guides",
      "Updated comparison guidance for diagram tools",
    ],
  },
  {
    date: "2026-09-28",
    title: "Ten new schema diagrams",
    summary:
      "Added ten popular PostgreSQL schemas, including Chinook, Pagila, DVD Rental, Northwind, and Spring Batch.",
    changes: [
      "Chinook, Pagila, DVD Rental, Northwind, and Spring Batch diagrams",
      "Library, hospital, RBAC, multi-tenant SaaS, and Better Auth diagrams",
      "Every page shows tables, keys, and relationships",
    ],
  },
  {
    date: "2026-09-26",
    title: "Free tools hub",
    summary:
      "Every free dbdiagramr tool now lives on one page, with the first converters and validators.",
    changes: [
      "One page for every free tool",
      "SQL formatter, schema analyzer, and other early tools in one place",
    ],
  },
  {
    date: "2026-09-17",
    title: "New PostgreSQL guides",
    summary:
      "Published practical guides on schema documentation and Supabase connection fixes.",
    changes: [
      "Schema documentation guide",
      "Supabase ENOTFOUND and pooler fixes",
    ],
  },
  {
    date: "2026-09-08",
    title: "A cleaner site and blog",
    summary:
      "Refreshed the site design, home page, and blog layout to make the product and guides easier to read.",
    changes: [
      "Refreshed site design",
      "Updated home page and blog layout",
      "New blog preview images",
    ],
  },
  {
    date: "2026-09-03",
    title: "More schemas and guides",
    summary:
      "Expanded the schema library and blog with more PostgreSQL references and tutorials.",
    changes: [
      "Added Stripe and e-commerce schema diagrams",
      "Published more PostgreSQL guides",
    ],
  },
  {
    date: "2026-08-30",
    title: "Paste SQL and search your schema",
    summary:
      "You can now paste PostgreSQL SQL instead of a connection string, then search and explore the diagram.",
    changes: [
      "Paste PostgreSQL DDL instead of a connection string",
      "Query mode import with column types",
      "Search tables in the diagram",
      "Clearer Supabase pooler errors",
    ],
  },
  {
    date: "2026-08-04",
    title: "Compare dbdiagramr with other tools",
    summary:
      "Added an alternatives hub with side-by-side comparisons for dbdiagram.io and DrawSQL.",
    changes: [
      "Alternatives hub",
      "dbdiagram.io and DrawSQL comparison pages",
    ],
  },
  {
    date: "2026-08-02",
    title: "Interactive diagrams on the home page",
    summary:
      "Diagrams are now interactive, with previews on the home page and schema pages.",
    changes: [
      "Pan, zoom, and drag tables",
      "Trace foreign keys by hovering",
      "Diagram previews on schema pages",
    ],
  },
  {
    date: "2026-07-25",
    title: "dbdiagramr goes live",
    summary:
      "Generate an interactive ER diagram from a PostgreSQL connection string, with no signup or diagram limit.",
    changes: [
      "Connect with a PostgreSQL URL and get a live diagram",
      "Clearer connection errors and toasts",
      "No signup and no diagram limit",
    ],
  },
];
