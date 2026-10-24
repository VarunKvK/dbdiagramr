import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import AuthorByline from "@/components/AuthorByline";
import { AUTHOR } from "@/data/authors";
import { getAllPosts, getPost } from "@/data/blog/posts";
import { blogBodies } from "@/data/blog/content";
import { organizationNode, personNode, PERSON_URL } from "@/lib/structuredData";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  const url = `https://www.dbdiagramr.space/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords.join(", "),
    authors: [{ name: AUTHOR.name, url: PERSON_URL }],
    alternates: { canonical: post.canonical ?? url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      images: [{ url: `/og/blog/${post.slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`/og/blog/${post.slug}.png`],
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const body = blogBodies[post.slug];
  if (!body) notFound();

  const postUrl = `https://www.dbdiagramr.space/blog/${post.slug}`;
  const relatedPosts = getAllPosts()
    .filter(
      (p) =>
        p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t))
    )
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#article`,
        headline: post.title,
        description: post.description,
        url: postUrl,
        image: `https://www.dbdiagramr.space/og/blog/${post.slug}.png`,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        author: personNode(),
        publisher: organizationNode(),
        mainEntityOfPage: postUrl,
        keywords: post.keywords.join(", "),
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
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: postUrl,
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
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          ← All posts
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-medium leading-tight text-ink md:text-4xl">
            {post.title}
          </h1>
          <AuthorByline
            published={post.date}
            updated={post.updated}
            readingMinutes={post.readingMinutes}
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[20px] border border-accent bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent"
              >
                #{tag}
              </span>
            ))}
          </div>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {post.description}
          </p>
        </div>

        <article
          className="max-w-none leading-relaxed text-muted [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-ink [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 hover:[&_a]:text-accent-hover [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1.5 [&_strong]:font-semibold [&_strong]:text-ink [&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-muted [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-[10px] [&_pre]:bg-ink [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white/85 [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-ink [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white/85"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Visualize your own database
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup required.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/visualize"
              className="inline-block rounded-[10px] bg-accent px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Try it free →
            </a>
            <a
              href="/schema"
              className="inline-block rounded-[10px] border border-white/40 px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              Browse schemas
            </a>
          </div>
        </section>

        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-ink">
              Related guides
            </h2>
            <div className="grid gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="block rounded-[20px] border border-border bg-white p-5 shadow-sm transition-colors hover:shadow-md"
                >
                  <div className="text-sm font-medium text-ink hover:text-accent">
                    {rel.title}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-muted">
                    {rel.description}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-[20px] border border-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
            Try it on your database
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href="/" className="font-medium text-accent hover:text-accent-hover">
              PostgreSQL ER Diagram →
            </Link>
            <Link href="/database-schema-analyzer" className="font-medium text-accent hover:text-accent-hover">
              Schema Health Analyzer →
            </Link>
          </div>
        </section>

        <div className="mt-8 text-center text-sm text-muted">
          <a
            href="https://github.com/VarunKvK/dbdiagramr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent hover:text-accent-hover"
          >
            Star on GitHub
          </a>
          {" · "}
          <a href="/blog" className="font-medium text-accent hover:text-accent-hover">
            More guides →
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
