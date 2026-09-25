import type { MetadataRoute } from "next";
import { getAllSchemaEntries } from "@/data/schemas/registry";
import { getAllPosts } from "@/data/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.dbdiagramr.space";
  // Honest lastmod: only bump when the route's source actually changed.
  // Do NOT use today's date on every build — Google treats that as noise
  // and stops trusting lastmod. Dates below = last git change per route.
  const staticLastmod: Record<string, string> = {
    "/": "2026-09-10",
    "/visualize": "2026-09-08",
    "/schema": "2026-09-10",
    "/blog": "2026-09-17",
    "/alternatives": "2026-08-30",
    "/dbdiagram-io-vs-dbdiagramr": "2026-09-17",
    "/drawsql-vs-dbdiagramr": "2026-09-08",
    "/postgres-er-diagram": "2026-09-09",
    "/supabase-schema-diagram": "2026-09-09",
    "/free-schema-generator": "2026-09-10",
    "/database-diagram-online": "2026-09-10",
    "/postgres-schema-visualizer": "2026-09-10",
    "/database-schema-analyzer": "2026-09-25",
    "/tools": "2026-09-25",
    "/sql-formatter": "2026-09-25",
  };

  const schemaUrls = getAllSchemaEntries().map((entry) => ({
    url: `${base}/schema/${entry.slug}`,
    lastModified: entry.lastUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogPostUrls = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date,
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
      url: `${base}/blog`,
      lastModified: staticLastmod["/blog"],
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/postgres-er-diagram`,
      lastModified: staticLastmod["/postgres-er-diagram"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/supabase-schema-diagram`,
      lastModified: staticLastmod["/supabase-schema-diagram"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/free-schema-generator`,
      lastModified: staticLastmod["/free-schema-generator"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/database-diagram-online`,
      lastModified: staticLastmod["/database-diagram-online"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/postgres-schema-visualizer`,
      lastModified: staticLastmod["/postgres-schema-visualizer"],
      changeFrequency: "monthly",
      priority: 0.8,
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
    ...schemaUrls,
    ...blogPostUrls,
  ];
}
