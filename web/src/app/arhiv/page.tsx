import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { ArchiveView } from "@/components/ArchiveView";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublishedStories, getTomorrowTeaser } from "@/lib/content";
import { toCard } from "@/lib/cards";
import { issueOpensAt } from "@/lib/date";
import styles from "./page.module.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Архив: все рассказы дня",
  description: "Все выпуски FantPub: короткие рассказы классиков в новых переводах — фантастика, мистика, жуткое и ирония. Фильтр по жанру и длине, от 2 до 20 минут.",
  alternates: { canonical: "/arhiv" },
};

export default function ArchivePage() {
  const now = Date.now();
  const cards = getPublishedStories(now).map(toCard).reverse();
  const tomorrow = getTomorrowTeaser(now);
  return (
    <main className={`page page--wide ${styles.page}`}>
      <Masthead />
      <header className={styles.head}>
        <h1 className={`display ${styles.title}`}>Архив</h1>
        <p className={styles.lead}>
          {cards.length} выпусков, и все открыты. Целая печать на корешке значит, что рассказ вас ещё ждёт.
        </p>
      </header>
      <ArchiveView
        cards={cards}
        tomorrow={tomorrow ? { ...tomorrow, opensAt: issueOpensAt(tomorrow.issue) } : null}
      />
      <SiteFooter />
    </main>
  );
}
