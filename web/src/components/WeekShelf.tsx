"use client";

import Link from "next/link";
import type { Route } from "next";
import { Spine } from "./Spine";
import { useHydrated, useShelf } from "@/lib/shelf";
import type { StoryCard } from "@/lib/types";
import { plural } from "@/lib/date";
import styles from "./WeekShelf.module.css";

/** The last issues as spines on a ledge. Read = sage bookmark, unread = whole wax dot. */
export function WeekShelf({ cards, todaySlug }: { cards: StoryCard[]; todaySlug: string }) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const readCount = hydrated ? cards.filter((c) => shelf.read[c.slug]).length : 0;
  return (
    <section className={styles.wrap} aria-labelledby="week-shelf">
      <div className={styles.head}>
        <h2 id="week-shelf" className={styles.h}>
          Полка недели
        </h2>
        <span className={styles.count}>
          {hydrated ? `прочитано ${readCount} из ${cards.length}` : `${cards.length} ${plural(cards.length, ["выпуск", "выпуска", "выпусков"])}`}
        </span>
      </div>
      <div className={styles.shelf}>
        <ul className={styles.row}>
          {cards.map((c) => (
            <li key={c.slug}>
              <Link href={`/rasskaz/${c.slug}` as Route} className={styles.link} prefetch={false}>
                <Spine
                  title={c.title}
                  issue={c.issue}
                  cloth={c.cloth}
                  minutes={c.minutes}
                  state={hydrated && shelf.read[c.slug] ? "read" : c.slug === todaySlug ? "today" : "unread"}
                />
                <span className="sr-only">
                  {c.title}, {c.minutes} мин{hydrated && shelf.read[c.slug] ? ", прочитано" : c.slug === todaySlug ? ", выпуск дня" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.ledge} aria-hidden="true" />
      </div>
      <Link href="/arhiv" className={styles.all}>
        Весь архив <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
