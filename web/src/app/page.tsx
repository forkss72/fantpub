import { PageHeader } from "@/components/ui/PageHeader";
import { HeaderActions } from "@/components/today/HeaderActions";
import { Hero } from "@/components/today/Hero";
import { ContinueCard } from "@/components/today/ContinueCard";
import { WeekShelf } from "@/components/today/WeekShelf";
import { GoalBlock } from "@/components/today/GoalBlock";
import { TodayOnboarding } from "@/components/today/TodayOnboarding";
import type { TodayBook } from "@/components/today/state";
import { getPublishedStories, getTodayStory, getTomorrowTeaser } from "@/lib/content";
import { humanDate, issueOpensAt, mskDayKey } from "@/lib/date";
import type { Story } from "@/lib/types";
import styles from "./page.module.css";

// The issue rolls over at 00:00 MSK; a cron also revalidates right after midnight.
export const revalidate = 300;

export const metadata = { alternates: { canonical: "/" } };

const slim = (s: Story): TodayBook => ({
  slug: s.slug,
  issue: s.issue,
  title: s.title,
  mood: s.mood || s.genres[0] || "",
  minutes: s.minutes,
  cover: { src: s.cover.src, srcSmall: s.cover.srcSmall, placeholder: s.cover.placeholder, colors: s.cover.colors },
});

export default function Today() {
  // server component re-rendered by ISR: "now" decides which issues are published
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const today = getTodayStory(now);
  const published = getPublishedStories(now);
  const teaser = getTomorrowTeaser(now);

  if (!today) {
    return (
      <main className="page">
        <PageHeader title="Сегодня" subtitle={humanDate(mskDayKey(now))} />
        <p className="t-sub">Первый выпуск откроется в полночь.</p>
      </main>
    );
  }

  const all = published.map(slim);
  const hero = slim(today);
  const tomorrow = teaser && {
    mood: teaser.mood || teaser.genres[0] || "",
    minutes: teaser.minutes,
    opensAt: issueOpensAt(teaser.issue),
    // the sealed book shows only the blurred small art
    cover: { ...teaser.cover, src: teaser.cover.srcSmall },
  };

  return (
    <main className={`page ${styles.today}`}>
      <div className="edge-top" aria-hidden="true" />
      <PageHeader title="Сегодня" subtitle={humanDate(today.date)} actions={<HeaderActions serverNow={now} />} />
      <Hero story={{ ...hero, authorName: today.author.name, year: today.year }} />
      <ContinueCard books={all} todaySlug={today.slug} />
      <WeekShelf books={all.filter((b) => b.slug !== today.slug).slice(-6).reverse()} all={all} todaySlug={today.slug} tomorrow={tomorrow} />
      <GoalBlock books={all} serverNow={now} />
      <TodayOnboarding today={hero} />
    </main>
  );
}
