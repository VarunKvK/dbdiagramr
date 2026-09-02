import type { MetadataRoute } from "next";
import { getAllSchemaEntries } from "@/data/schemas/registry";
import { getAllPosts } from "@/data/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.dbdiagramr.space";
  const today = new Date().toISOString().split("T")[0];

  const schemaUrls = getAllSchemaEntries().map((entry) => ({
    url: `${base}/schema/${entry.slug}`,
    lastModified: today,
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
      lastModified: today,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/visualize`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/schema`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/alternatives`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/dbdiagram-io-vs-dbdiagramr`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/drawsql-vs-dbdiagramr`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/blog`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...schemaUrls,
    ...blogPostUrls,
  ];
}
