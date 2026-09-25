import Link from "next/link";
import { getAllPosts } from "@/data/blog/posts";

const toolLinks = [
  { href: "/postgres-er-diagram", label: "PostgreSQL ER Diagram" },
  { href: "/supabase-schema-diagram", label: "Supabase Schema Diagram" },
  { href: "/free-schema-generator", label: "Free Schema Generator" },
  { href: "/database-diagram-online", label: "Database Diagram Online" },
  { href: "/postgres-schema-visualizer", label: "Schema Visualizer" },
  { href: "/database-schema-analyzer", label: "Schema Health Analyzer" },
  { href: "/sql-formatter", label: "SQL Formatter" },
];

const schemaLinks = [
  { href: "/schema/supabase", label: "Supabase" },
  { href: "/schema/nextauth", label: "NextAuth.js" },
  { href: "/schema/stripe", label: "Stripe" },
  { href: "/schema/ecommerce", label: "E-commerce" },
];

export default function BlogTeaser() {
  const posts = getAllPosts().slice(0, 6);

  return (
    <section className="bg-white py-20 mt-[120px] mb-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              Blog
            </span>
            <h2 className="mt-3 text-3xl font-medium text-ink md:text-4xl">
              PostgreSQL guides
            </h2>
            <p className="mt-2 max-w-xl text-muted">
              Practical guides on schemas, ER diagrams, and connection strings —
              all grounded in live database introspection.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:inline-flex"
          >
            View all posts →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl bg-cream p-6 ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-xs text-muted">
                {post.date} · {post.readingMinutes} min
              </div>
              <h3 className="mt-3 line-clamp-2 text-lg font-medium leading-tight text-ink group-hover:text-indigo-600">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                {post.description}
              </p>
              <div className="mt-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-500">
                Read article →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/blog"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all posts →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-cream p-6 ring-1 ring-black/5">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted">
              Free tools
            </h3>
            <ul className="mt-3 space-y-2">
              {toolLinks.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="text-sm font-medium text-ink hover:text-indigo-600 hover:underline"
                  >
                    {t.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-cream p-6 ring-1 ring-black/5">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted">
              Popular schemas
            </h3>
            <ul className="mt-3 space-y-2">
              {schemaLinks.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-sm font-medium text-ink hover:text-indigo-600 hover:underline"
                  >
                    {s.label} schema diagram →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
