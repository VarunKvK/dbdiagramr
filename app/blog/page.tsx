import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import { MetaPill } from "@/components/ui/pills";
import { getAllPosts } from "@/data/blog/posts";

export const metadata: Metadata = {
  title: "Blog | PostgreSQL Schema Guides & ER Diagram Tutorials",
  description:
    "Guides on PostgreSQL schemas, ER diagrams, and database visualization, from connection strings to Stripe and Supabase schema breakdowns.",
  alternates: {
    canonical: "https://www.dbdiagramr.space/blog",
  },
};

export default function BlogHubPage() {
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://www.dbdiagramr.space/blog",
        name: "dbdiagramr Blog | PostgreSQL Schema Guides",
        description:
          "Guides on PostgreSQL schemas, ER diagrams, connection strings, and database visualization.",
        url: "https://www.dbdiagramr.space/blog",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((post, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: post.title,
            url: `https://www.dbdiagramr.space/blog/${post.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.dbdiagramr.space",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://www.dbdiagramr.space/blog",
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-[20px] border border-accent px-3 py-1 font-mono text-xs font-medium text-accent">
            Blog
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            PostgreSQL schema guides
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-muted">
            Practical guides on ER diagrams, connection strings, and the real
            schemas behind Supabase, Stripe, and modern e-commerce, all
            grounded in live PostgreSQL introspection.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {posts.map((post, i) => (
            <article
              key={post.slug}
              className={`group flex flex-col rounded-[20px] bg-ink p-6 text-white transition-colors hover:bg-pine ${
                i === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <MetaPill>{post.date}</MetaPill>
                <MetaPill>{post.readingMinutes} min</MetaPill>
                {post.tags.slice(0, 2).map((tag) => (
                  <MetaPill key={tag}>#{tag}</MetaPill>
                ))}
              </div>

              <h2 className="mt-4 text-xl font-semibold leading-tight tracking-tight md:text-2xl">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>

              <p className="mt-2 text-sm font-medium leading-relaxed text-white/60">
                {post.description}
              </p>

              <div className="mt-auto pt-5">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-block rounded-[20px] bg-accent px-4 py-1.5 font-mono text-xs font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Want to see your own schema?
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-medium text-white/70">
            Paste a PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/visualize"
              className="inline-block rounded-[10px] bg-accent px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Try it free →
            </a>
            <a
              href="https://github.com/VarunKvK/dbdiagramr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-[10px] border border-white/40 px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              View on GitHub
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
