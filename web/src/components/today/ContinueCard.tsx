"use client";

import Link from "next/link";
import type { Route } from "next";
import { Book } from "@/components/ui/Book";
import { useShelf } from "@/lib/shelf";
import { coverVars } from "@/lib/cover";
import { inProgress, minutesLeft, pickContinue, type TodayBook } from "./state";
import styles from "./ContinueCard.module.css";
import { BookTransition } from "@/components/book/BookTransition";

/** Apple's Continue card: an unfinished older issue, filled with its cover's dark colour. */
export function ContinueCard({ books, todaySlug }: { books: TodayBook[]; todaySlug: string }) {
  const shelf = useShelf();
  const book = pickContinue(shelf, books, todaySlug);
  if (!book) return null;
  const pct = inProgress(shelf, book.slug);

  return (
    <section className={styles.section} aria-labelledby="continue-title">
      <h2 id="continue-title" className="t-title2">
        Продолжить
      </h2>
      <Link href={`/kniga/${book.slug}` as Route} className={`${styles.card} press`} style={coverVars(book.cover.colors)}>
        <BookTransition slug={book.slug}>
          <div className={styles.thumb}>
            <Book cover={book.cover} width={40} />
          </div>
        </BookTransition>
        <span className={styles.lines}>
          <span className={styles.title}>{book.title}</span>
          <span className={`${styles.meta} num`}>
            {pct}% · осталось {minutesLeft(book.minutes, pct)} мин
          </span>
        </span>
      </Link>
    </section>
  );
}
