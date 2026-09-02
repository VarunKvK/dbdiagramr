import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import { getAllPosts } from "@/data/blog/posts";

export const metadata: Metadata = {
  title: "Blog — PostgreSQL Schema Guides & ER Diagram Tutorials",
  description:
    "Guides on PostgreSQL schemas, ER diagrams, and database visualization — from connection strings to Stripe and Supabase schema breakdowns.",
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
        name: "dbdiagramr Blog — PostgreSQL Schema Guides",
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
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Blog
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            PostgreSQL schema guides
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Practical guides on ER diagrams, connection strings, and the real
            schemas behind Supabase, Stripe, and modern e-commerce — all
            grounded in live PostgreSQL introspection.
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-md md:p-8"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <time dateTime={post.date}>{post.date}</time>
                <span>·</span>
                <span>{post.readingMinutes} min</span>
                <span>·</span>
                <div className="flex gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#fafafa] px-2 py-0.5 text-xs font-medium ring-1 ring-black/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="mt-3 text-xl font-medium leading-tight text-ink group-hover:text-indigo-600 md:text-2xl">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>

              <p className="mt-2 leading-relaxed text-muted">
                {post.description}
              </p>

              <div className="mt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
                >
                  Read article →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-16 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-medium text-white">
            Want to see your own schema?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste a PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup required.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-medium text-ink transition-colors hover:bg-indigo-100"
          >
            Try it free →
          </a>
        </section>
      </div>
      <Footer />
    </main>
  );
}
