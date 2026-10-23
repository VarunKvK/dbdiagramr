import type { MetadataRoute } from "next";
import { getAllSchemaEntries } from "@/data/schemas/registry";
import { getAllPosts } from "@/data/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.dbdiagramr.space";
  // Honest lastmod: only bump when the route's source actually changed.
  // Do NOT use today's date on every build — Google treats that as noise
  // and stops trusting lastmod. Dates below = last git change per route.
  const staticLastmod: Record<string, string> = {
    "/": "2026-10-20",
    "/visualize": "2026-09-08",
    "/supabase-rls-check": "2026-10-23",
    "/schema": "2026-09-27",
    "/blog": "2026-10-23",
    "/alternatives": "2026-10-23",
    "/dbdiagram-io-vs-dbdiagramr": "2026-10-23",
    "/drawsql-vs-dbdiagramr": "2026-10-23",
    "/chartdb-alternative": "2026-10-23",
    "/supabase-er-diagram": "2026-10-23",
    "/database-schema-analyzer": "2026-09-25",
    "/tools": "2026-10-23",
    "/sql-formatter": "2026-09-25",
    "/csv-to-sql": "2026-09-28",
    "/json-to-sql": "2026-09-28",
    "/sql-validator": "2026-09-28",
    "/sql-to-mermaid": "2026-09-28",
    "/sql-to-typescript": "2026-09-28",
    "/sql-to-prisma": "2026-09-28",
    "/postgres-connection-string": "2026-10-23",
    "/sql-schema-diff": "2026-10-10",
    "/dbml-to-sql": "2026-10-10",
    "/prisma-erd-generator": "2026-10-10",
    "/github-schema-action": "2026-10-13",
    "/pricing": "2026-10-19",
  };

  const schemaUrls = getAllSchemaEntries().map((entry) => ({
    url: `${base}/schema/${entry.slug}`,
    lastModified: entry.lastUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogPostUrls = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.updated ?? post.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: base,
      lastModified: staticLastmod["/"],
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/visualize`,
      lastModified: staticLastmod["/visualize"],
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/supabase-rls-check`,
      lastModified: staticLastmod["/supabase-rls-check"],
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/schema`,
      lastModified: staticLastmod["/schema"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/alternatives`,
      lastModified: staticLastmod["/alternatives"],
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/dbdiagram-io-vs-dbdiagramr`,
      lastModified: staticLastmod["/dbdiagram-io-vs-dbdiagramr"],
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/drawsql-vs-dbdiagramr`,
      lastModified: staticLastmod["/drawsql-vs-dbdiagramr"],
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/chartdb-alternative`,
      lastModified: staticLastmod["/chartdb-alternative"],
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/blog`,
      lastModified: staticLastmod["/blog"],
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/supabase-er-diagram`,
      lastModified: staticLastmod["/supabase-er-diagram"],
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/database-schema-analyzer`,
      lastModified: staticLastmod["/database-schema-analyzer"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/tools`,
      lastModified: staticLastmod["/tools"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/sql-formatter`,
      lastModified: staticLastmod["/sql-formatter"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/csv-to-sql`,
      lastModified: staticLastmod["/csv-to-sql"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/json-to-sql`,
      lastModified: staticLastmod["/json-to-sql"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/sql-validator`,
      lastModified: staticLastmod["/sql-validator"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/sql-to-mermaid`,
      lastModified: staticLastmod["/sql-to-mermaid"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/sql-to-typescript`,
      lastModified: staticLastmod["/sql-to-typescript"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/sql-to-prisma`,
      lastModified: staticLastmod["/sql-to-prisma"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/postgres-connection-string`,
      lastModified: staticLastmod["/postgres-connection-string"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/sql-schema-diff`,
      lastModified: staticLastmod["/sql-schema-diff"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/dbml-to-sql`,
      lastModified: staticLastmod["/dbml-to-sql"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/prisma-erd-generator`,
      lastModified: staticLastmod["/prisma-erd-generator"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/github-schema-action`,
      lastModified: staticLastmod["/github-schema-action"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/pricing`,
      lastModified: staticLastmod["/pricing"],
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...schemaUrls,
    ...blogPostUrls,
  ];
}
