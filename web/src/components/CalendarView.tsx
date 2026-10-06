"use client";

import Link from "next/link";
import type { Route } from "next";
import { Cover } from "./Cover";
import { useHydrated, useShelf } from "@/lib/shelf";
import { issueDate } from "@/lib/date";
import type { StoryCard } from "@/lib/types";
import styles from "./CalendarView.module.css";

const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const DOW = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

type Props = { cards: StoryCard[]; todayIssue: number; totalIssues: number };

/** Advent-style month grid: past days are covers, today glows, the future waits in kraft paper. */
export function CalendarView({ cards, todayIssue, totalIssues }: Props) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const byDate = new Map(cards.map((c) => [c.date, c]));
  const first = issueDate(1);
  const last = issueDate(Math.max(totalIssues, todayIssue));
  const today = issueDate(todayIssue);

  const [fy, fm] = first.split("-").map(Number);
  const [ly, lm] = last.split("-").map(Number);
  const months: { y: number; m: number }[] = [];
  for (let y = fy, m = fm; y < ly || (y === ly && m <= lm); m === 12 ? ((m = 1), y++) : m++) months.push({ y, m });

  return (
    <div className={styles.wrap}>
      {months.reverse().map(({ y, m }) => {
        const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
        const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
        return (
          <section key={`${y}-${m}`} className={styles.month} aria-label={`${MONTHS[m - 1]} ${y}`}>
            <h2 className={styles.title}>
              {MONTHS[m - 1]} <span>{y}</span>
            </h2>
            <div className={styles.grid}>
              {DOW.map((d) => (
                <span key={d} className={styles.dow} aria-hidden="true">
                  {d}
                </span>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <span key={`o${i}`} />
              ))}
              {Array.from({ length: daysIn }, (_, i) => {
                const day = i + 1;
                const iso = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const card = byDate.get(iso);
                const isToday = iso === today;
                const future = iso > today && iso >= first && iso <= last;
                if (card) {
                  const read = hydrated && !!shelf.read[card.slug];
                  return (
                    <Link
                      key={iso}
                      href={`/rasskaz/${card.slug}` as Route}
                      prefetch={false}
                      className={styles.cell}
                      data-today={isToday}
                      data-read={read}
                      aria-label={`${day} — «${card.title}»${read ? ", прочитано" : ""}`}
                    >
                      <Cover title={card.title} issue={card.issue} motif={card.motif} cloth={card.cloth} label="none" />
                      <span className={styles.day}>{day}</span>
                      <span className={styles.mark} aria-hidden="true" />
                    </Link>
                  );
                }
                if (future) {
                  return (
                    <span key={iso} className={`${styles.cell} ${styles.parcel}`} role="img" aria-label={`${day}-е — выпуск ещё запечатан`}>
                      <span className={styles.string} aria-hidden="true" />
                      <span className={styles.dot} aria-hidden="true" />
                      <span className={styles.day}>{day}</span>
                    </span>
                  );
                }
                return (
                  <span key={iso} className={`${styles.cell} ${styles.empty}`} aria-hidden="true">
                    <span className={styles.day}>{day}</span>
                  </span>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
