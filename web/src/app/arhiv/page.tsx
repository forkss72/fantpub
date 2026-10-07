import type { Metadata } from "next";
import { ArchiveView } from "@/components/archive/ArchiveView";
import { toItem, type TomorrowItem } from "@/components/archive/items";
import { getPublishedStories, getTomorrowTeaser } from "@/lib/content";
import { currentIssue, issueDate, issueOpensAt } from "@/lib/date";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Архив: все рассказы дня",
  description: "Все выпуски FantPub: короткие рассказы классиков в новых переводах — фантастика, мистика, жуткое и ирония. Фильтр по настроению и длине, от 2 до 20 минут.",
  alternates: { canonical: "/arhiv" },
  openGraph: { title: "Архив FantPub: все рассказы дня", description: "Короткие рассказы классиков в новых переводах — каждый день по одному. Все прошлые выпуски открыты.", url: "/arhiv" },
};

export default function ArchivePage() {
  // re-rendered by ISR: "now" decides which issues are published
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const items = getPublishedStories(now).map(toItem).reverse();
  const t = getTomorrowTeaser(now);
  // the sealed book gets the tiny blurred placeholder only: tomorrow's art stays closed too
  const tomorrow: TomorrowItem | null = t && {
    issue: t.issue,
    date: issueDate(t.issue),
    mood: t.mood,
    minutes: t.minutes,
    opensAt: issueOpensAt(t.issue),
    cover: { src: t.cover.placeholder, srcSmall: t.cover.placeholder, placeholder: t.cover.placeholder, colors: t.cover.colors },
  };
  return (
    <main className="page">
      <div className="edge-top" aria-hidden="true" />
      <ArchiveView items={items} tomorrow={tomorrow} todayIssue={currentIssue(now)} />
    </main>
  );
}
