import type { Metadata } from "next";
import { SearchView, type AuthorEntry, type MoodEntry, type SearchItem } from "@/components/search/SearchView";
import { surname, toItem } from "@/components/archive/items";
import { getAuthors, getPublishedStories } from "@/lib/content";
import { currentIssue } from "@/lib/date";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Поиск",
  description: "Поиск по рассказам FantPub: названия, настроения и авторы.",
  alternates: { canonical: "/poisk" },
  robots: { index: false, follow: true },
};

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");

export default function SearchPage() {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const stories = getPublishedStories(now).reverse();

  const items: SearchItem[] = stories.map((s) => ({
    ...toItem(s),
    // the author is matched separately, only where the seal is already lifted
    text: norm([s.title, s.hook, s.teaser, s.mood, ...s.genres].join(" ")),
  }));

  const byMood = new Map<string, typeof stories>();
  for (const s of stories) if (s.mood) byMood.set(s.mood, [...(byMood.get(s.mood) ?? []), s]);
  const moods: MoodEntry[] = [...byMood.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "ru"))
    .map(([mood, list]) => ({
      mood,
      count: list.length,
      colors: list[0].cover.colors,
      covers: list.slice(0, 3).map((s) => toItem(s).cover),
    }));

  const count = new Map<string, number>();
  for (const s of stories) count.set(s.author.slug, (count.get(s.author.slug) ?? 0) + 1);
  const authors: AuthorEntry[] = Object.values(getAuthors())
    .filter((a) => count.has(a.slug))
    .sort((a, b) => surname(a.name).localeCompare(surname(b.name), "ru"))
    .map((a) => ({ slug: a.slug, name: a.name, count: count.get(a.slug)!, key: norm(`${a.name} ${a.nameShort ?? ""}`) }));

  return (
    <main className="page">
      <div className="edge-top" aria-hidden="true" />
      <SearchView items={items} moods={moods} authors={authors} todayIssue={currentIssue(now)} />
    </main>
  );
}
