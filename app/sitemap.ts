import type { MetadataRoute } from "next";
import { getAllSchemaEntries } from "@/data/schemas/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dbdiagramr.space";
  const today = new Date().toISOString().split("T")[0];

  const schemaUrls = getAllSchemaEntries().map((entry) => ({
    url: `${base}/schema/${entry.slug}`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.8,
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
    ...schemaUrls,
  ];
}
