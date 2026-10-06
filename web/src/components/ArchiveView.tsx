"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Cover } from "./Cover";
import { Countdown } from "./Countdown";
import { useHydrated, useShelf } from "@/lib/shelf";
import { humanDate, plural } from "@/lib/date";
import type { StoryCard } from "@/lib/types";
import styles from "./ArchiveView.module.css";

type Props = {
  cards: StoryCard[];
  tomorrow: { mood: string; minutes: number; genres: string[]; issue: number; opensAt: number } | null;
};

const LENGTHS = [
  { key: "all", label: "Любая длина", test: () => true },
  { key: "short", label: "до 5 мин", test: (m: number) => m <= 5 },
  { key: "mid", label: "5–10 мин", test: (m: number) => m > 5 && m <= 10 },
  { key: "long", label: "10+ мин", test: (m: number) => m > 10 },
] as const;

const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function genreLabel(g: string) {
  return g === "хоррор" ? "жуткое" : g;
}

export function ArchiveView({ cards, tomorrow }: Props) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const [genre, setGenre] = useState<string>("all");
  const [len, setLen] = useState<(typeof LENGTHS)[number]["key"]>("all");
  const [unread, setUnread] = useState(false);
  const [view, setView] = useState<"shelf" | "list">("shelf");

  const genres = useMemo(() => {
    const counts = new Map<string, number>();
    cards.forEach((c) => c.genres.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g);
  }, [cards]);

  const filtered = cards.filter((c) => {
    if (genre !== "all" && !c.genres.includes(genre)) return false;
    if (!LENGTHS.find((l) => l.key === len)!.test(c.minutes)) return false;
    if (unread && hydrated && shelf.read[c.slug]) return false;
    if (q && !`${c.title} ${c.authorName} ${c.mood} ${c.genres.join(" ")}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const groups = useMemo(() => {
    const m = new Map<string, StoryCard[]>();
    for (const c of filtered) {
      const [y, mo] = c.date.split("-").map(Number);
      const k = `${MONTHS[mo - 1]} ${y}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(c);
    }
    return [...m.entries()];
  }, [filtered]);

  const readCount = hydrated ? cards.filter((c) => shelf.read[c.slug]).length : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <label className={styles.search}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
          </svg>
          <span className="sr-only">Поиск по названию и автору</span>
          <input type="search" placeholder="Название, автор, настроение" value={query} onChange={(e) => setQuery(e.target.value)} enterKeyHint="search" />
        </label>

        <div className={styles.chips} role="group" aria-label="Жанр">
          <button type="button" className={styles.chip} aria-pressed={genre === "all"} onClick={() => setGenre("all")}>
            Все жанры
          </button>
          {genres.map((g) => (
            <button key={g} type="button" className={styles.chip} aria-pressed={genre === g} onClick={() => setGenre(genre === g ? "all" : g)}>
              {genreLabel(g)}
            </button>
          ))}
        </div>
        <div className={styles.chips} role="group" aria-label="Длина">
          {LENGTHS.map((l) => (
            <button key={l.key} type="button" className={styles.chip} aria-pressed={len === l.key} onClick={() => setLen(l.key)}>
              {l.label}
            </button>
          ))}
          <button type="button" className={styles.chip} aria-pressed={unread} onClick={() => setUnread((v) => !v)}>
            Непрочитанные
          </button>
        </div>

        <div className={styles.bar}>
          <span className={`mono ${styles.count}`}>
            {filtered.length === cards.length ? `${cards.length} ${plural(cards.length, ["выпуск", "выпуска", "выпусков"])}` : `найдено ${filtered.length}`}
            {hydrated && readCount > 0 && ` · прочитано ${readCount}`}
          </span>
          <div className={styles.toggle} role="group" aria-label="Вид">
            <button type="button" aria-pressed={view === "shelf"} onClick={() => setView("shelf")}>
              Обложки
            </button>
            <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
              Список
            </button>
          </div>
        </div>
      </div>

      {tomorrow && genre === "all" && !q && (
        <div className={styles.tomorrow}>
          <span className={styles.parcel} aria-hidden="true">
            <span />
          </span>
          <div>
            <p className={`mono ${styles.tomorrowKicker}`}>Выпуск № {tomorrow.issue} · запечатан</p>
            <p className={styles.tomorrowText}>
              Завтра: {tomorrow.mood || genreLabel(tomorrow.genres[0])}, {tomorrow.minutes} мин
            </p>
            <p className={`mono ${styles.tomorrowTimer}`}>
              откроется через <Countdown target={tomorrow.opensAt} />
            </p>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <img src="/pabchik/searching.webp" alt="" width={120} height={120} />
          <p>Пабчик обыскал все полки — такого нет. Попробуйте другой жанр или длину.</p>
          <button
            type="button"
            className="pill pill--ghost"
            onClick={() => {
              setQuery("");
              setGenre("all");
              setLen("all");
              setUnread(false);
            }}
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {groups.map(([month, items]) => (
        <section key={month} className={styles.group} aria-label={month}>
          <h2 className={styles.month}>{month}</h2>
          {view === "shelf" ? (
            <ul className={styles.grid}>
              {items.map((c) => {
                const read = hydrated && !!shelf.read[c.slug];
                return (
                  <li key={c.slug}>
                    <Link href={`/rasskaz/${c.slug}` as Route} className={styles.item} data-read={read}>
                      <span className={styles.coverWrap}>
                        <Cover title={c.title} issue={c.issue} motif={c.motif} cloth={c.cloth} label="compact" />
                        <span className={styles.mark} aria-hidden="true" />
                      </span>
                      <span className={styles.caption}>
                        <span className={styles.capTitle}>{c.title}</span>
                        <span className={styles.capMeta}>
                          {c.authorName} · {c.minutes} мин
                        </span>
                      </span>
                      {read && <span className="sr-only">прочитано</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className={styles.list}>
              {items.map((c) => {
                const read = hydrated && !!shelf.read[c.slug];
                return (
                  <li key={c.slug}>
                    <Link href={`/rasskaz/${c.slug}` as Route} className={styles.row} data-read={read}>
                      <span className={`mono ${styles.rowDate}`}>
                        № {c.issue}
                        <br />
                        {humanDate(c.date)}
                      </span>
                      <span className={styles.rowBody}>
                        <span className={styles.rowTitle}>{c.title}</span>
                        <span className={styles.rowMeta}>
                          {c.authorName} · {c.genres.map(genreLabel).join(", ")} · {c.minutes} мин
                        </span>
                      </span>
                      <span className={styles.rowMark} aria-label={read ? "прочитано" : "не прочитано"} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
