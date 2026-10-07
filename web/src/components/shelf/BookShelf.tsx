"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { Book } from "@/components/ui/Book";
import type { StoryCard } from "@/lib/types";
import styles from "./BookShelf.module.css";
import { BookTransition } from "@/components/book/BookTransition";

export type ShelfItem = {
  card: StoryCard;
  /** accessible name of the link: title plus status */
  label: string;
  caption?: ReactNode;
  /** 0…100 → a hairline progress bar under the ledge */
  progress?: number;
};

const WIDE = "(min-width: 1000px)";
const MID = "(min-width: 640px)";

function subscribe(cb: () => void) {
  const mqs = [matchMedia(WIDE), matchMedia(MID)];
  mqs.forEach((m) => m.addEventListener("change", cb));
  return () => mqs.forEach((m) => m.removeEventListener("change", cb));
}
const getCols = () => (matchMedia(WIDE).matches ? 6 : matchMedia(MID).matches ? 4 : 3);

/** 2.5…4.5°, stable per story */
function leanOf(slug: string): number {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return 2.5 + (Math.abs(h) % 5) * 0.5;
}

const cover = (it: ShelfItem) => (
  <Book cover={it.card.cover} title={it.card.title} issue={it.card.issue} width="100cqw" sizes="(min-width: 1000px) 150px, (min-width: 640px) 22vw, 30vw" />
);

/**
 * Books standing on a lit glass ledge, covers out, rows of 3 (phone) to 6 (desktop).
 * The last book leans on its neighbour. Rows are built here so a short last row still gets a full ledge.
 */
export function BookShelf({ items, label }: { items: ShelfItem[]; label: string }) {
  const cols = useSyncExternalStore(subscribe, getCols, () => 3);
  const rows: ShelfItem[][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  const captions = items.some((it) => it.caption != null);
  // the shelf stays mounted under the book sheet: hand the shared name over to the sheet while it is open
  const pathname = usePathname();
  const inSheet = pathname.startsWith("/kniga/") ? decodeURIComponent(pathname.split("/")[2] ?? "") : "";

  return (
    <div className={styles.shelf} role="list" aria-label={label} style={{ "--cols": cols } as CSSProperties}>
      {rows.map((row, r) => (
        <div key={r} className={styles.row}>
          <div className={styles.books}>
            {row.map((it, i) => {
              const last = r === rows.length - 1 && i === row.length - 1 && i > 0;
              return (
                <div key={it.card.slug} role="listitem" className={styles.slot}>
                  <Link
                    href={`/kniga/${it.card.slug}` as Route}
                    className={`${styles.link} press`}
                    aria-label={it.label}
                    data-lean={last ? "" : undefined}
                    style={last ? ({ "--lean": `${leanOf(it.card.slug)}deg` } as CSSProperties) : undefined}
                  >
                    {it.card.slug === inSheet ? (
                      cover(it)
                    ) : (
                      <BookTransition slug={it.card.slug}>
                        {cover(it)}
                      </BookTransition>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
          <div className={styles.ledge} aria-hidden="true" />
          {captions && (
            <div className={styles.captions} aria-hidden="true">
              {row.map((it) => (
                <div key={it.card.slug} className={styles.caption}>
                  {it.caption}
                  {it.progress != null && (
                    <span className={styles.bar}>
                      <span style={{ inlineSize: `${it.progress}%` }} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** A bare ledge, for the empty shelf. */
export function Ledge({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.bare}>
      {children}
      <div className={styles.ledge} aria-hidden="true" />
    </div>
  );
}
