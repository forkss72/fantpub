"use client";

import Link from "next/link";
import type { Route } from "next";
import { GoalGauge, WeekDots } from "@/components/ui/Goal";
import { useShelf } from "@/lib/shelf";
import { streak, todaySeconds, week } from "@/lib/stats";
import { plural } from "@/lib/date";
import { pickContinue, useDayNow, type TodayBook } from "./state";
import styles from "./GoalBlock.module.css";

const days = (n: number) => `${n} ${plural(n, ["день", "дня", "дней"])}`;

/** Apple Reading Goals, one calm block: gauge, the week, the streak, and a way back in. */
export function GoalBlock({ books, serverNow }: { books: TodayBook[]; serverNow: number }) {
  const shelf = useShelf();
  const now = useDayNow(serverNow);
  const seconds = todaySeconds(shelf, now);
  const goal = shelf.goal.daily;
  const { current, record } = streak(shelf, now);
  const next = seconds < goal * 60 ? pickContinue(shelf, books) : null;

  const line =
    record === 0
      ? "Дочитайте рассказ — начнётся серия"
      : current === 0
        ? `Рекорд серии: ${days(record)}`
        : `Серия: ${days(current)} · ${current >= record ? "это рекорд" : `рекорд ${record}`}`;

  return (
    <section className={styles.goal} aria-labelledby="goal-title">
      <h2 id="goal-title" className="t-title2">
        Цель на день
      </h2>
      <GoalGauge seconds={seconds} goalMinutes={goal} />
      <div className={styles.week}>
        <WeekDots days={week(shelf, now)} />
      </div>
      <p className={`t-sub ${styles.streak}`}>{line}</p>
      {next && (
        <Link href={`/kniga/${next.slug}` as Route} className={`${styles.keep} press`}>
          <span className={styles.keepLabel}>Продолжить чтение</span>
          <span className={styles.keepTitle}>{next.title}</span>
        </Link>
      )}
    </section>
  );
}
