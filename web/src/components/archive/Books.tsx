"use client";

import Link from "next/link";
import type { Route } from "next";
import { Book } from "@/components/ui/Book";
import { Countdown } from "@/components/ui/Countdown";
import { SealedAuthor } from "@/components/ui/SealedAuthor";
import { BookmarkSimple, Check } from "@/components/ui/icons";
import { useHydrated, useShelf } from "@/lib/shelf";
import type { ArchiveItem, TomorrowItem } from "./items";
import { cap } from "./items";
import styles from "./Books.module.css";

/** Shared cover name for the fly-into-sheet transition (see components/book/BookTransition). */
import { BookTransition as SharedBook } from "@/components/book/BookTransition";
export { SharedBook };

const NEUTRAL_ART = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 3'%3E%3Cdefs%3E%3ClinearGradient id='g' x2='0' y2='1'%3E%3Cstop stop-color='%238a8a8e'/%3E%3Cstop offset='1' stop-color='%23545458'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='2' height='3' fill='url(%23g)'/%3E%3C/svg%3E";
const NEUTRAL = { base: "#77777b", bg: "#5b5b60", dark: "#3f3f43", light: "#e4e4e6", tint: "#8e8e93" };

type BookState = { kind: "read" } | { kind: "progress"; percent: number } | { kind: "want" } | { kind: "new" };

/** Personal state of one book; null until hydrated (the server renders for a first-time visitor). */
export function useBookState(slug: string): BookState | null {
  const shelf = useShelf();
  const hydrated = useHydrated();
  if (!hydrated) return null;
  if (shelf.read[slug]) return { kind: "read" };
  const p = shelf.percent[slug] ?? 0;
  if (p > 0 && p < 100) return { kind: "progress", percent: p };
  if (shelf.want[slug]) return { kind: "want" };
  return { kind: "new" };
}

const href = (slug: string) => `/kniga/${slug}` as Route;

function Status({ state }: { state: BookState | null }) {
  if (!state) return null;
  switch (state.kind) {
    case "read":
      return (
        <span className={styles.state}>
          <Check size={13} weight="bold" aria-hidden="true" />
          Прочитано
        </span>
      );
    case "progress":
      return <span className={`${styles.state} num`}>{state.percent}%</span>;
    case "want":
      return (
        <span className={styles.state}>
          <BookmarkSimple size={13} weight="fill" aria-hidden="true" />
          Хочу прочитать
        </span>
      );
    default:
      return (
        <span className={styles.state}>
          <span className={styles.dot} aria-hidden="true" />
          Новый
        </span>
      );
  }
}

const TILE_SIZES = "(min-width: 900px) 190px, (min-width: 600px) 30vw, 45vw";

/**
 * Library grid cell: the book, then one status line (Apple Books Library).
 * `seal` (the author's page): the tile stays in the HTML for search engines, but in blind mode it
 * shows only once this story is read; until then a blurred, untitled book stands in its place.
 */
export function BookTile({ item, today, seal }: { item: ArchiveItem; today?: boolean; seal?: boolean }) {
  const state = useBookState(item.slug);
  const link = (
    <Link href={href(item.slug)} scroll={false} className={styles.tileLink}>
      <span className={styles.coverBox}>
        <SharedBook slug={item.slug}>
          <Book cover={item.cover} title={item.title} issue={item.issue} width="100cqi" sizes={TILE_SIZES} />
        </SharedBook>
      </span>
      <span className="sr-only">
        «{item.title}», выпуск № {item.issue}
        {", "}
      </span>
      <span className={styles.status}>
        {today ? (
          <span className={styles.state}>
            <span className={styles.today}>Сегодня</span>
            {state?.kind === "read" && <Check size={13} weight="bold" role="img" aria-label="прочитано" />}
            {state?.kind === "progress" && <span className="num">{state.percent}%</span>}
          </span>
        ) : (
          <Status state={state} />
        )}
        <span className={`${styles.minutes} num`}>{item.minutes} мин</span>
      </span>
    </Link>
  );
  if (!seal) return <li className={styles.tile}>{link}</li>;
  // a plain sealed book: neither the art nor its colours may hint at which story this is
  const p = NEUTRAL_ART;
  return (
    <li className={styles.tile} data-seal={item.slug}>
      <div className="reveal-only">{link}</div>
      <div className="blind-only">
        <span className={styles.coverBox}>
          <Book cover={{ src: p, srcSmall: p, placeholder: p, colors: NEUTRAL }} width="100cqi" sizes="45vw" sealed />
        </span>
        <p className={styles.status}>Откроется после прочтения</p>
      </div>
    </li>
  );
}

/** Tomorrow: a sealed book, its mood and the time left. Not a link. */
export function TomorrowTile({ item }: { item: TomorrowItem }) {
  return (
    <li className={styles.tile}>
      <div className={styles.sealed}>
        <span className={styles.coverBox}>
          <Book cover={item.cover} width="100cqi" sizes="45vw" sealed />
        </span>
        <span className={styles.sealText}>
          <span className={styles.sealMood}>{cap(item.mood)}</span>
          <span className={`${styles.sealMin} num`}>{item.minutes} мин</span>
        </span>
      </div>
      <p className={styles.status}>
        <span className={styles.state}>Завтра</span>
        <span className={`${styles.minutes} num`}>
          <span className="sr-only">откроется </span>через <Countdown target={item.opensAt} />
        </span>
      </p>
    </li>
  );
}

/** Inset-list row: mini cover, title, meta, sealed author, trailing state. */
export function BookRow({ item, today }: { item: ArchiveItem; today?: boolean }) {
  const state = useBookState(item.slug);
  return (
    <li className={styles.item}>
      <Link href={href(item.slug)} scroll={false} className={styles.row} data-seal={item.slug}>
        <SharedBook slug={item.slug}>
          <Book cover={item.cover} width={40} sizes="40px" />
        </SharedBook>
        <span className={styles.main}>
          <span className={styles.body}>
            <span className={styles.rowTitle}>{item.title}</span>
            <span className={`${styles.rowMeta} num`}>
              № {item.issue} · {item.mood} · {item.minutes} мин
            </span>
            <span className={`${styles.rowMeta} ${styles.author}`}>
              <SealedAuthor name={item.authorName} year={item.year} mask="Автор скрыт" />
            </span>
          </span>
          <span className={styles.trail}>
            {today && <span className={styles.today}>Сегодня</span>}
            {state?.kind === "read" && <Check size={17} weight="bold" role="img" aria-label="Прочитано" className={styles.check} />}
            {state?.kind === "progress" && <span className="num">{state.percent}%</span>}
            {state?.kind === "want" && <BookmarkSimple size={17} weight="fill" role="img" aria-label="Хочу прочитать" />}
            {state?.kind === "new" && !today && <span className={styles.dot} role="img" aria-label="Новый" />}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function TomorrowRow({ item }: { item: TomorrowItem }) {
  return (
    <li className={styles.item}>
      <div className={styles.row}>
        <Book cover={item.cover} width={40} sizes="40px" sealed />
        <span className={styles.main}>
          <span className={styles.body}>
            <span className={styles.rowTitle}>Завтра</span>
            <span className={`${styles.rowMeta} num`}>
              {cap(item.mood)}, {item.minutes} мин
            </span>
          </span>
          <span className={`${styles.trail} num`}>
            <span>
              <span className="sr-only">откроется </span>через <Countdown target={item.opensAt} />
            </span>
          </span>
        </span>
      </div>
    </li>
  );
}
