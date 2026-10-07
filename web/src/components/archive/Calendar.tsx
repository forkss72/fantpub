"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Book } from "@/components/ui/Book";
import { CaretLeft, CaretRight, Check } from "@/components/ui/icons";
import { useHydrated, useShelf } from "@/lib/shelf";
import { humanDate, weekdayIndex } from "@/lib/date";
import { WEEK_LETTERS } from "@/lib/stats";
import { SharedBook } from "./Books";
import { MONTHS, type ArchiveItem, type TomorrowItem } from "./items";
import styles from "./Calendar.module.css";

type Props = {
  items: ArchiveItem[];
  tomorrow: TomorrowItem | null;
  /** ISO day of today's issue */
  today: string;
  /** slugs that pass the current filter; the rest are dimmed */
  match: (item: ArchiveItem) => boolean;
};

type Month = { y: number; m: number };
const key = ({ y, m }: Month) => `${y}-${String(m).padStart(2, "0")}`;
const parse = (iso: string): Month => {
  const [y, m] = iso.split("-").map(Number);
  return { y, m };
};

/** One month at a time: a cover in every published day, tomorrow sealed, the rest frosted. */
export function Calendar({ items, tomorrow, today, match }: Props) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const byDate = new Map(items.map((i) => [i.date, i]));
  const first = items.at(-1)?.date ?? today;
  const last = tomorrow?.date ?? today;

  const months: Month[] = [];
  for (let { y, m } = parse(first); key({ y, m }) <= key(parse(last)); m === 12 ? ((m = 1), y++) : m++) months.push({ y, m });
  const [idx, setIdx] = useState(() => Math.max(0, months.findIndex((x) => key(x) === key(parse(today)))));
  const cur = months[Math.min(idx, months.length - 1)];

  const daysIn = new Date(Date.UTC(cur.y, cur.m, 0)).getUTCDate();
  const offset = weekdayIndex(`${key(cur)}-01`);
  const label = `${MONTHS[cur.m - 1]} ${cur.y}`;

  return (
    <section className={styles.wrap} aria-label="Календарь выпусков">
      <div className={styles.switcher}>
        <button type="button" className={styles.arrow} aria-label="Предыдущий месяц" disabled={idx <= 0} onClick={() => setIdx(idx - 1)}>
          <CaretLeft size={20} weight="bold" aria-hidden="true" />
        </button>
        <h2 className={styles.month} aria-live="polite">
          {label}
        </h2>
        <button type="button" className={styles.arrow} aria-label="Следующий месяц" disabled={idx >= months.length - 1} onClick={() => setIdx(idx + 1)}>
          <CaretRight size={20} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <div className={styles.week} aria-hidden="true">
        {WEEK_LETTERS.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>

      <ol className={styles.grid}>
        {Array.from({ length: offset }, (_, i) => (
          <li key={`o${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: daysIn }, (_, i) => {
          const day = i + 1;
          const iso = `${key(cur)}-${String(day).padStart(2, "0")}`;
          const item = byDate.get(iso);
          const num = (
            <span className={`${styles.num} num`} aria-hidden="true">
              {day}
            </span>
          );
          if (item) {
            const read = hydrated && !!shelf.read[item.slug];
            return (
              <li key={iso}>
                <Link
                  href={`/kniga/${item.slug}` as Route}
                  scroll={false}
                  className={styles.cell}
                  data-today={iso === today ? "" : undefined}
                  data-dim={match(item) ? undefined : ""}
                  aria-label={`${humanDate(iso)}: «${item.title}»${read ? ", прочитано" : ""}${iso === today ? ", сегодня" : ""}`}
                >
                  <SharedBook slug={item.slug}>
                    <Book cover={item.cover} width="100cqi" sizes="(min-width: 600px) 80px, 13vw" />
                  </SharedBook>
                  {num}
                  {read && (
                    <span className={styles.read} aria-hidden="true">
                      <Check size={10} weight="bold" />
                    </span>
                  )}
                </Link>
              </li>
            );
          }
          if (tomorrow && iso === tomorrow.date) {
            return (
              <li key={iso}>
                <span className={styles.cell} role="img" aria-label={`${humanDate(iso)}: выпуск откроется завтра`}>
                  <Book cover={tomorrow.cover} width="100cqi" sizes="13vw" sealed />
                  {num}
                </span>
              </li>
            );
          }
          if (iso > today) {
            return (
              <li key={iso} aria-hidden="true">
                <span className={`${styles.cell} ${styles.future}`}>{num}</span>
              </li>
            );
          }
          return (
            <li key={iso} aria-hidden="true">
              <span className={`${styles.cell} ${styles.empty}`}>{num}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
