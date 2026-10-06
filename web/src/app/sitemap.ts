import type { MetadataRoute } from "next";
import { getAuthors, getPublishedStories } from "@/lib/content";
import { issueOpensAt } from "@/lib/date";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = getPublishedStories();
  const latest = stories.at(-1);
  const authors = Object.keys(getAuthors()).filter((a) => stories.some((s) => s.author.slug === a));
  return [
    { url: `${SITE_URL}/`, lastModified: latest ? new Date(issueOpensAt(latest.issue)) : new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/arhiv`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/avtory`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/o-proekte`, changeFrequency: "monthly", priority: 0.3 },
    ...stories.map((s) => ({
      url: `${SITE_URL}/rasskaz/${s.slug}`,
      lastModified: new Date(issueOpensAt(s.issue)),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...authors.map((a) => ({ url: `${SITE_URL}/avtor/${a}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
