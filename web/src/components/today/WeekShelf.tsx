"use client";

import Link from "next/link";
import type { Route } from "next";
import { Book } from "@/components/ui/Book";
import { Countdown } from "@/components/ui/Countdown";
import { CaretRight, Check, LockSimple } from "@/components/ui/icons";
import { useShelf } from "@/lib/shelf";
import { inProgress, pickContinue, type TodayBook } from "./state";
import styles from "./WeekShelf.module.css";
import { BookTransition } from "@/components/book/BookTransition";

type Tomorrow = { mood: string; minutes: number; opensAt: number; cover: TodayBook["cover"] };

const WIDTH = "var(--shelf-w)";
const SIZES = "(min-width: 900px) 150px, 34vw";

/**
 * «Эта неделя»: the latest issues on a shelf band, newest first, with tomorrow's sealed book
 * leading the row. Today's book and the Continue book already carry their shared names above.
 */
export function WeekShelf({ books, all, todaySlug, tomorrow }: { books: TodayBook[]; all: TodayBook[]; todaySlug: string; tomorrow: Tomorrow | null }) {
  const shelf = useShelf();
  const continueSlug = pickContinue(shelf, all, todaySlug)?.slug;

  return (
    <section className={styles.band} aria-labelledby="week-title">
      <div className={styles.head}>
        <h2 id="week-title" className="t-title2">
          <Link href={"/arhiv" as Route} className={styles.titleLink}>
            Эта неделя
            <CaretRight size={18} weight="bold" aria-hidden="true" className={styles.caret} />
          </Link>
        </h2>
      </div>
      <ol className={styles.row}>
        {tomorrow && (
          <li className={styles.item}>
            <div className={styles.sealed}>
              <Book cover={tomorrow.cover} width={WIDTH} sizes={SIZES} sealed />
              <LockSimple size={26} weight="fill" className={styles.lock} aria-hidden="true" />
            </div>
            <p className={styles.status}>
              <span className={styles.strong}>Завтра</span>
              <span>
                {tomorrow.mood}, {tomorrow.minutes} мин
              </span>
              <span className="num">
                через <Countdown target={tomorrow.opensAt} />
              </span>
            </p>
          </li>
        )}
        {books.map((b) => {
          const named = b.slug !== todaySlug && b.slug !== continueSlug;
          const cover = <Book cover={b.cover} title={b.title} issue={b.issue} width={WIDTH} sizes={SIZES} />;
          return (
            <li key={b.slug} className={styles.item}>
              <Link href={`/kniga/${b.slug}` as Route} className={`${styles.link} press`}>
                {named ? (
                  <BookTransition slug={b.slug}>
                    {cover}
                  </BookTransition>
                ) : (
                  cover
                )}
                <span className="sr-only">
                  «{b.title}», № {b.issue},{" "}
                </span>
                <Status book={b} today={b.slug === todaySlug} read={!!shelf.read[b.slug]} pct={inProgress(shelf, b.slug)} />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Status({ book, today, read, pct }: { book: TodayBook; today: boolean; read: boolean; pct: number }) {
  if (read)
    return (
      <span className={styles.status}>
        <span className={styles.done}>
          <Check size={13} weight="bold" aria-hidden="true" />
          Прочитано
        </span>
      </span>
    );
  if (pct)
    return (
      <span className={styles.status}>
        <span className="num">{pct}%</span>
      </span>
    );
  return (
    <span className={styles.status}>
      {today ? <span className={styles.strong}>Новый</span> : <span className="num">{book.minutes} мин</span>}
    </span>
  );
}
