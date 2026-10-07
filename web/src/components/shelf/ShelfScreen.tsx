"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Segmented } from "@/components/ui/Segmented";
import { AvatarLink } from "@/components/profile/Avatar";
import { useHydrated, useShelf, type ShelfState } from "@/lib/shelf";
import { guessScore, totalMinutes } from "@/lib/stats";
import { plural } from "@/lib/date";
import type { StoryCard } from "@/lib/types";
import { BookShelf, Ledge, type ShelfItem } from "./BookShelf";
import { QuoteList } from "./QuoteList";
import { KeyImport } from "./KeyImport";
import styles from "./ShelfScreen.module.css";

type Tab = "reading" | "want" | "read" | "quotes";

const TABS: { value: Tab; label: string }[] = [
  { value: "reading", label: "Читаю" },
  { value: "want", label: "Хочу" },
  { value: "read", label: "Прочитано" },
  { value: "quotes", label: "Цитаты" },
];

const EMPTY: Record<Tab, { title: string; text: string; cta: string; href: Route }> = {
  reading: { title: "Ничего не начато", text: "Здесь будут рассказы, которые вы читаете", cta: "Открыть рассказ дня", href: "/" },
  want: { title: "Список пуст", text: "Нажмите «+» на странице рассказа, чтобы отложить его", cta: "Открыть архив", href: "/arhiv" },
  read: { title: "Полка пока пустая", text: "Здесь встанут прочитанные рассказы", cta: "Открыть рассказ дня", href: "/" },
  quotes: { title: "Цитат пока нет", text: "Выделите фразу в рассказе и сохраните её", cta: "Открыть рассказ дня", href: "/" },
};

function lists(cards: StoryCard[], s: ShelfState) {
  const pct = (c: StoryCard) => s.percent[c.slug] ?? 0;
  const last = (c: StoryCard) => s.touched[c.slug] ?? s.opened[c.slug] ?? 0;
  const reading = cards.filter((c) => !s.read[c.slug] && pct(c) > 0).sort((a, b) => last(b) - last(a) || pct(b) - pct(a));
  const want = cards.filter((c) => s.want[c.slug] && !s.read[c.slug]).sort((a, b) => s.want[b.slug] - s.want[a.slug]);
  const read = cards.filter((c) => s.read[c.slug]).sort((a, b) => s.read[b.slug] - s.read[a.slug]);
  return { reading, want, read };
}

function summary(read: StoryCard[], s: ShelfState): string {
  const n = read.length;
  // legacy shelves have no reading log: fall back to the length of what was finished
  const min = Math.max(
    totalMinutes(s.log),
    read.reduce((m, c) => m + c.minutes, 0),
  );
  const g = guessScore(s.guesses);
  const parts = [];
  if (n) parts.push(`${n} ${plural(n, ["рассказ", "рассказа", "рассказов"])}`);
  if (min) parts.push(`${min} ${plural(min, ["минута", "минуты", "минут"])}`);
  if (g.total) parts.push(`угадано ${g.right} из ${g.total}`);
  return parts.join(" · ");
}

export function ShelfScreen({ cards }: { cards: StoryCard[] }) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const [picked, setPicked] = useState<Tab | null>(null);

  return (
    <main className={`page ${styles.page}`}>
      <PageHeader title="Полка" actions={<AvatarLink />} />
      {hydrated ? <Body cards={cards} shelf={shelf} tab={picked} onTab={setPicked} /> : <div className={styles.placeholder} aria-busy="true" />}
      <KeyImport />
    </main>
  );
}

function Body({ cards, shelf, tab: picked, onTab }: { cards: StoryCard[]; shelf: ShelfState; tab: Tab | null; onTab: (t: Tab) => void }) {
  const { reading, want, read } = lists(cards, shelf);
  const quotes = shelf.quotes;
  // land on the finished books when there are any: that is the shelf
  const tab: Tab = picked ?? (read.length ? "read" : reading.length ? "reading" : want.length ? "want" : quotes.length ? "quotes" : "read");
  const line = summary(read, shelf);
  const bySlug = new Map(cards.map((c) => [c.slug, c]));

  const left = (c: StoryCard) => Math.max(1, Math.round((c.minutes * (100 - (shelf.percent[c.slug] ?? 0))) / 100));
  let items: ShelfItem[] = [];
  if (tab === "reading")
    items = reading.map((c) => {
      const p = shelf.percent[c.slug] ?? 0;
      return { card: c, progress: p, caption: `${p}% · ещё ${left(c)} мин`, label: `«${c.title}», прочитано ${p}%` };
    });
  if (tab === "want")
    items = want.map((c) => {
      const p = shelf.percent[c.slug] ?? 0;
      return p > 0
        ? { card: c, progress: p, caption: `${p}% · ещё ${left(c)} мин`, label: `«${c.title}», прочитано ${p}%` }
        : { card: c, caption: `№ ${c.issue} · ${c.minutes} мин`, label: `«${c.title}», выпуск ${c.issue}, ${c.minutes} мин` };
    });
  if (tab === "read") items = read.map((c) => ({ card: c, label: `«${c.title}», прочитано` }));

  const empty = tab === "quotes" ? quotes.length === 0 : items.length === 0;

  return (
    <>
      {line && <p className={`t-sub num ${styles.summary}`}>{line}</p>}
      <div className={styles.seg}>
        <Segmented label="Раздел полки" value={tab} options={TABS} onChange={onTab} />
      </div>
      <section className={styles.panel} aria-label={TABS.find((t) => t.value === tab)!.label}>
        {empty ? (
          <Empty tab={tab} />
        ) : tab === "quotes" ? (
          <QuoteList quotes={quotes} cards={bySlug} />
        ) : (
          <BookShelf key={tab} items={items} label={TABS.find((t) => t.value === tab)!.label} />
        )}
      </section>
    </>
  );
}

function Empty({ tab }: { tab: Tab }) {
  const e = EMPTY[tab];
  return (
    <div className={styles.empty}>
      {tab === "read" && (
        <Ledge>
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized webp */}
          <img className={styles.sleeper} src="/pabchik/sleeping.webp" alt="" width={150} height={150} fetchPriority="high" />
        </Ledge>
      )}
      <div className={styles.emptyText}>
        <p className={styles.emptyTitle}>{e.title}</p>
        <p className="t-sub">{e.text}</p>
      </div>
      <Link href={e.href} className={`${styles.capsule} press`}>
        {e.cta}
      </Link>
    </div>
  );
}
