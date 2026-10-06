import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { TodayHero } from "@/components/TodayHero";
import { WeekShelf } from "@/components/WeekShelf";
import { Countdown } from "@/components/Countdown";
import { IntroCard } from "@/components/IntroCard";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublishedStories, getTodayStory, getTomorrowTeaser } from "@/lib/content";
import { toCard } from "@/lib/cards";
import { dayIndex, issueOpensAt, weekday } from "@/lib/date";
import styles from "./page.module.css";

// The issue rolls over at 00:00 MSK; a cron also revalidates right after midnight.
export const revalidate = 300;

export default function Home() {
  const now = Date.now();
  const today = getTodayStory(now);
  const published = getPublishedStories(now);
  const tomorrow = getTomorrowTeaser(now);

  if (!today) {
    return (
      <main className="page">
        <Masthead />
        <p>Первый выпуск скоро.</p>
      </main>
    );
  }

  const week = published.slice(-7).map(toCard);
  const alternatives = published
    .filter((s) => s.slug !== today.slug && s.minutes <= 7)
    .slice(-6)
    .reverse()
    .map((s) => ({ slug: s.slug, title: s.title, minutes: s.minutes }));

  return (
    <main className={`page ${styles.home}`}>
      <Masthead right={<span className={`mono ${styles.date}`}>{weekday(today.date)}</span>} />
      <TodayHero
        story={{ ...toCard(today), hook: today.hook, paragraphs: today.blocks.filter((b) => b.type === "p").length }}
        dayIndex={dayIndex(now)}
        alternatives={alternatives}
      />

      <IntroCard />

      {tomorrow && (
        <aside className={styles.tomorrow} aria-label="Следующий выпуск">
          <span className={styles.tomorrowSeal} aria-hidden="true" />
          <span>
            Завтра: <strong>{tomorrow.mood || tomorrow.genres[0]}</strong>, {tomorrow.minutes} мин
          </span>
          <span className={styles.tomorrowTimer}>
            через <Countdown target={issueOpensAt(tomorrow.issue)} />
          </span>
        </aside>
      )}

      <WeekShelf cards={week} todaySlug={today.slug} />

      <section className={styles.rules} aria-labelledby="rules">
        <h2 id="rules" className="sr-only">
          Как это устроено
        </h2>
        <ol>
          <li>
            <strong>Один рассказ в день.</strong> Новый выпуск открывается в полночь по Москве.
          </li>
          <li>
            <strong>Печать ломается один раз.</strong> Автор и год спрятаны до финала — угадаете?
          </li>
          <li>
            <strong>Прошлое открыто всегда.</strong> Пропустили — ничего страшного, <Link href="/arhiv">архив</Link> никуда не денется.
          </li>
        </ol>
      </section>

      <SiteFooter />
    </main>
  );
}
