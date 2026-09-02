import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import { getAllPosts, getPost } from "@/data/blog/posts";
import { blogBodies } from "@/data/blog/content";

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
    alternates: { canonical: post.canonical ?? url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          "@type": "Person",
          name: "dbdiagramr",
          url: "https://github.com/VarunKvK/dbdiagramr",
        },
        publisher: {
          "@type": "Organization",
          name: "dbdiagramr",
          url: "https://www.dbdiagramr.space",
          logo: {
            "@type": "ImageObject",
            url: "https://www.dbdiagramr.space/favicon.svg",
          },
        },
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
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is ${post.title.toLowerCase()}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: post.description,
            },
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
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          ← All posts
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <time dateTime={post.date}>{post.date}</time>
            <span>·</span>
            <span>{post.readingMinutes} min read</span>
            <div className="ml-2 flex gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-medium leading-tight text-ink md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {post.description}
          </p>
        </div>

        <article
          className="max-w-none leading-relaxed text-muted [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-ink [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted [&_a]:text-indigo-600 [&_a]:underline [&_a]:decoration-indigo-200 hover:[&_a]:text-indigo-500 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1.5 [&_strong]:font-semibold [&_strong]:text-ink [&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-[#fafafa] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-muted [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#1a1a1a] [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-[#e5e5e5] [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-ink [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#e5e5e5]"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        <section className="mt-16 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-medium text-white">
            Visualize your own database
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup required.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/visualize"
              className="inline-block rounded-lg bg-white px-8 py-3 font-medium text-ink transition-colors hover:bg-indigo-100"
            >
              Try it free →
            </a>
            <a
              href="/schema"
              className="inline-block rounded-lg border border-white/20 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              Browse schemas
            </a>
          </div>
        </section>

        <div className="mt-8 text-center text-sm text-muted">
          <a
            href="https://github.com/VarunKvK/dbdiagramr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Star on GitHub
          </a>
          {" · "}
          <a href="/blog" className="font-medium text-indigo-600 hover:text-indigo-500">
            More guides →
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
