import Link from "next/link";
import { getAllPosts } from "@/data/blog/posts";
import { getAllSchemaEntries } from "@/data/schemas/registry";
import { MetaPill } from "@/components/ui/pills";
import LinkExplorer from "@/app/sections/LinkExplorer";

const toolLinks = [
  { href: "/", label: "PostgreSQL ER Diagram" },
  { href: "/database-schema-analyzer", label: "Schema Health Analyzer" },
  { href: "/sql-formatter", label: "SQL Formatter" },
  { href: "/csv-to-sql", label: "CSV to SQL" },
  { href: "/json-to-sql", label: "JSON to SQL" },
  { href: "/sql-validator", label: "SQL Validator" },
  { href: "/sql-to-mermaid", label: "SQL to Mermaid" },
  { href: "/sql-to-typescript", label: "SQL to TypeScript" },
  { href: "/sql-to-prisma", label: "SQL to Prisma" },
  { href: "/postgres-connection-string", label: "Connection String Builder" },
  { href: "/sql-schema-diff", label: "Schema Diff" },
  { href: "/dbml-to-sql", label: "DBML to SQL" },
  { href: "/prisma-erd-generator", label: "Prisma ERD" },
  { href: "/github-schema-action", label: "PR Schema Diff Action" },
];

const schemaLinks = getAllSchemaEntries().map((entry) => ({
  href: `/schema/${entry.slug}`,
  label: entry.name,
}));

function BlogCard({
  post,
  tall = false,
}: {
  post: ReturnType<typeof getAllPosts>[number];
  tall?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col rounded-[20px] bg-ink p-5 text-white transition-colors hover:bg-pine ${
        tall ? "md:row-span-2" : ""
      }`}
    >
      <div className="flex flex-wrap gap-2">
        <MetaPill>{post.date}</MetaPill>
        <MetaPill>{post.readingMinutes} min</MetaPill>
      </div>
      <h3
        className={`mt-4 font-semibold leading-snug tracking-tight ${
          tall ? "text-2xl" : "text-xl"
        }`}
      >
        {post.title}
      </h3>
      <p
        className={`mt-2 text-sm font-medium leading-relaxed text-white/60 ${
          tall ? "" : "line-clamp-2"
        }`}
      >
        {post.description}
      </p>
      <div className="mt-auto pt-5">
        <span className="inline-block rounded-[20px] bg-accent px-4 py-1.5 font-mono text-xs font-medium text-white transition-colors group-hover:bg-accent-hover">
          Read More
        </span>
      </div>
    </Link>
  );
}

export default function BlogTeaser() {
  const posts = getAllPosts().slice(0, 5);
  const [featured, ...rest] = posts;

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
              Guides
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-5xl">
              Learn from real <span className="text-accent">schemas</span>
            </h2>
            <p className="mt-2 max-w-xl font-medium text-muted">
              Practical guides on schemas, ER diagrams, and connection strings.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden shrink-0 rounded-[10px] border border-accent px-5 py-2.5 text-xs font-medium text-accent transition-colors hover:bg-accent-soft md:inline-flex"
          >
            View all posts →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featured && <BlogCard post={featured} tall />}
          {rest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/blog"
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            View all posts →
          </Link>
        </div>

        <div className="mt-6">
          <LinkExplorer
            tools={toolLinks}
            schemas={schemaLinks.map((s) => ({
              ...s,
              label: `${s.label} schema`,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
