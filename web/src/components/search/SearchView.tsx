"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Route } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Book } from "@/components/ui/Book";
import { CaretRight, MagnifyingGlass, X } from "@/components/ui/icons";
import { BookRow } from "@/components/archive/Books";
import { cap, type ArchiveItem } from "@/components/archive/items";
import { useHydrated, useShelf } from "@/lib/shelf";
import { coverVars } from "@/lib/cover";
import { plural } from "@/lib/date";
import type { CoverColors } from "@/lib/types";
import books from "@/components/archive/Books.module.css";
import grouped from "@/components/archive/Grouped.module.css";
import styles from "./SearchView.module.css";

export type SearchItem = ArchiveItem & { text: string };
export type MoodEntry = { mood: string; count: number; colors: CoverColors; covers: ArchiveItem["cover"][] };
export type AuthorEntry = { slug: string; name: string; count: number; key: string };

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
const stories = (n: number) => `${n} ${plural(n, ["рассказ", "рассказа", "рассказов"])}`;

type Props = { items: SearchItem[]; moods: MoodEntry[]; authors: AuthorEntry[]; todayIssue: number };

export function SearchView({ items, moods, authors, todayIssue }: Props) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const words = norm(query).trim().split(" ").filter(Boolean);

  // an author's name finds a story only once its seal is lifted: typing «Саки» must not point at an unread book
  const authorOpen = (slug: string) => hydrated && (!shelf.prefs.blind || !!shelf.read[slug]);
  const hits = words.length
    ? items.filter((i) => {
        const hay = authorOpen(i.slug) ? `${i.text} ${norm(i.authorName)}` : i.text;
        return words.every((w) => hay.includes(w));
      })
    : [];
  const authorHits = words.length ? authors.filter((a) => words.every((w) => a.key.includes(w))) : [];
  const nothing = words.length > 0 && hits.length === 0 && authorHits.length === 0;

  return (
    <>
      <PageHeader title="Поиск" />

      <form className={styles.field} role="search" onSubmit={(e) => {
          e.preventDefault();
          // the keyboard's «Найти» just hides the keyboard: results are already live
          (e.currentTarget.elements[0] as HTMLInputElement | undefined)?.blur();
        }}>
        <MagnifyingGlass size={19} weight="bold" className={styles.lens} aria-hidden="true" />
        <input
          type="search"
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Названия, настроения, авторы"
          aria-label="Поиск по рассказам"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button type="button" className={styles.clear} aria-label="Очистить поиск" onClick={() => setQuery("")}>
            <X size={11} weight="bold" aria-hidden="true" />
          </button>
        )}
      </form>

      <p className="sr-only" role="status">
        {words.length ? (nothing ? "Ничего не нашлось" : `Найдено: ${stories(hits.length)}`) : ""}
      </p>

      {!words.length && (
        <>
          <section className={styles.section} aria-labelledby="moods">
            <h2 className={`t-title2 ${styles.h}`} id="moods">
              Настроения
            </h2>
            <ul className={styles.tiles}>
              {moods.map((m) => (
                <li key={m.mood}>
                  <button
                    type="button"
                    className={styles.tile}
                    style={coverVars(m.colors)}
                    onClick={() => setQuery(cap(m.mood))}
                    aria-label={`${cap(m.mood)}: ${stories(m.count)}`}
                  >
                    <span className={styles.tileText} aria-hidden="true">
                      <span className={styles.tileLabel}>{cap(m.mood)}</span>
                      <span className={`${styles.tileCount} num`}>{stories(m.count)}</span>
                    </span>
                    <span className={styles.fan} aria-hidden="true">
                      {m.covers.map((c, i) => (
                        <span key={c.src} className={styles.fanBook} style={{ "--i": i, "--n": m.covers.length } as CSSProperties}>
                          <Book cover={c} width={58} sizes="58px" />
                        </span>
                      ))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="authors">
            <h2 className={`t-title2 ${styles.h}`} id="authors">
              Авторы
            </h2>
            <AuthorList authors={authors} />
          </section>
        </>
      )}

      {hits.length > 0 && (
        <section className={styles.section} aria-labelledby="hits">
          <h2 className={`t-title2 ${styles.h}`} id="hits">
            Рассказы
          </h2>
          <ul className={`${books.list} ${styles.full}`}>
            {hits.map((i) => (
              <BookRow key={i.slug} item={i} today={i.issue === todayIssue} />
            ))}
          </ul>
        </section>
      )}

      {authorHits.length > 0 && (
        <section className={styles.section} aria-labelledby="author-hits">
          <h2 className={`t-title2 ${styles.h}`} id="author-hits">
            Авторы
          </h2>
          <AuthorList authors={authorHits} />
        </section>
      )}

      {nothing && (
        <div className={styles.empty}>
          <p className="t-title2">Ничего не нашлось</p>
          <p className="t-sub">Попробуйте другое слово или настроение.</p>
        </div>
      )}
    </>
  );
}

/** A directory, not a key: names and counts only, never which unread story is whose. */
function AuthorList({ authors }: { authors: AuthorEntry[] }) {
  return (
    <ul className={grouped.list}>
      {authors.map((a) => (
        <li key={a.slug}>
          <Link href={`/avtor/${a.slug}` as Route} className={grouped.row}>
            <span className={grouped.text}>
              <span className={grouped.label}>{a.name}</span>
            </span>
            <span className={`${grouped.value} num`}>{stories(a.count)}</span>
            <CaretRight size={15} weight="bold" className={grouped.chev} aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
