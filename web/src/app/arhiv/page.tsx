import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import { Masthead } from "@/components/Masthead";
import { ArchiveView } from "@/components/ArchiveView";
import { SiteFooter } from "@/components/SiteFooter";
import { getAllStories, getPublishedStories, getTomorrowTeaser } from "@/lib/content";
import { toCard } from "@/lib/cards";
import { currentIssue, issueOpensAt, plural } from "@/lib/date";
import styles from "./page.module.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Архив: все рассказы дня",
  description: "Все выпуски FantPub: короткие рассказы классиков в новых переводах — фантастика, мистика, жуткое и ирония. Фильтр по жанру и длине, от 2 до 20 минут.",
  alternates: { canonical: "/arhiv" },
  openGraph: { title: "Архив FantPub: все рассказы дня", description: "Короткие рассказы классиков в новых переводах — каждый день по одному. Все прошлые выпуски открыты.", url: "/arhiv" },
};

export default function ArchivePage() {
  // server component re-rendered by ISR: "now" decides which issues are published
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const cards = getPublishedStories(now).map(toCard).reverse();
  const tomorrow = getTomorrowTeaser(now);
  return (
    <PageTransition>
      <main className={`page page--wide ${styles.page}`}>
      <Masthead />
      <header className={styles.head}>
        <h1 className={`display ${styles.title}`}>Архив</h1>
        <p className={styles.lead}>
          {cards.length} {plural(cards.length, ["выпуск", "выпуска", "выпусков"])}, и все открыты. Целая печать на корешке значит, что рассказ вас ещё ждёт.
        </p>
      </header>
      <ArchiveView
        cards={cards}
        tomorrow={tomorrow ? { ...tomorrow, opensAt: issueOpensAt(tomorrow.issue) } : null}
        todayIssue={currentIssue(now)}
        totalIssues={Math.max(0, ...getAllStories().map((s) => s.issue))}
      />
      <SiteFooter />
    </main>
      </PageTransition>
  );
}
