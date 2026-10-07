"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassButton } from "@/components/ui/GlassButton";
import { PillMenu, type PillItem } from "@/components/ui/PillMenu";
import { Segmented } from "@/components/ui/Segmented";
import { Check, Funnel, X } from "@/components/ui/icons";
import { useShelf } from "@/lib/shelf";
import { plural } from "@/lib/date";
import { BookRow, BookTile, TomorrowRow, TomorrowTile } from "./Books";
import { Calendar } from "./Calendar";
import { cap, MONTHS, type ArchiveItem, type TomorrowItem } from "./items";
import books from "./Books.module.css";
import styles from "./ArchiveView.module.css";

type View = "covers" | "calendar" | "list";
type Filter = "all" | "unread" | "short" | `mood:${string}`;

const SHORT = 7;
const issues = (n: number) => `${n} ${plural(n, ["выпуск", "выпуска", "выпусков"])}`;

type Props = {
  /** newest first */
  items: ArchiveItem[];
  tomorrow: TomorrowItem | null;
  todayIssue: number;
};

export function ArchiveView({ items, tomorrow, todayIssue }: Props) {
  const shelf = useShelf();
  const [view, setView] = useState<View>("covers");
  const [filter, setFilter] = useState<Filter>("all");

  const today = items.find((i) => i.issue === todayIssue)?.date ?? tomorrow?.date ?? "";
  const pass = (mood: string, minutes: number, slug?: string) => {
    if (filter === "unread") return !slug || !shelf.read[slug];
    if (filter === "short") return minutes <= SHORT;
    if (filter.startsWith("mood:")) return mood === filter.slice(5);
    return true;
  };
  const match = (i: ArchiveItem) => pass(i.mood, i.minutes, i.slug);
  const shown = items.filter(match);
  const showTomorrow = tomorrow && pass(tomorrow.mood, tomorrow.minutes) ? tomorrow : null;

  // month sections, newest first; tomorrow opens the section of its own month
  const groups: { key: string; items: ArchiveItem[]; tomorrow?: TomorrowItem }[] = [];
  const section = (iso: string) => {
    const k = iso.slice(0, 7);
    let g = groups.find((x) => x.key === k);
    if (!g) groups.push((g = { key: k, items: [] }));
    return g;
  };
  if (showTomorrow) section(showTomorrow.date).tomorrow = showTomorrow;
  for (const i of shown) section(i.date).items.push(i);
  const thisYear = today.slice(0, 4);
  const monthName = (k: string) => `${MONTHS[Number(k.slice(5)) - 1]}${k.slice(0, 4) === thisYear ? "" : ` ${k.slice(0, 4)}`}`;

  const moods = [...new Set(items.map((i) => i.mood).filter(Boolean))];
  const filterLabel = filter === "unread" ? "Непрочитанные" : filter === "short" ? "Короткие" : filter.startsWith("mood:") ? cap(filter.slice(5)) : "";
  const option = (f: Filter, label: string): PillItem => ({ label, icon: filter === f ? Check : undefined, onSelect: () => setFilter(f) });
  const menu: PillItem[] = [
    option("all", "Все"),
    option("unread", "Непрочитанные"),
    ...moods.map((m) => option(`mood:${m}`, cap(m))),
    option("short", `Короткие, до ${SHORT} мин`),
  ];

  const empty = shown.length === 0 && !showTomorrow;

  return (
    <>
      <PageHeader
        title="Архив"
        subtitle={issues(items.length)}
        actions={
          <PillMenu
            label="Фильтр"
            placement="down-end"
            items={menu}
            trigger={(p) => <GlassButton {...p} icon={Funnel} label={filterLabel ? `Фильтр: ${filterLabel}` : "Фильтр"} />}
          />
        }
      />

      <div className={styles.controls}>
        <Segmented
          value={view}
          onChange={setView}
          label="Вид архива"
          options={[
            { value: "covers", label: "Обложки" },
            { value: "calendar", label: "Календарь" },
            { value: "list", label: "Список" },
          ]}
        />
        {filter !== "all" && (
          <p className={styles.token}>
            <button type="button" className={styles.chip} onClick={() => setFilter("all")} aria-label={`Сбросить фильтр «${filterLabel}»`}>
              {filterLabel}
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
            <span className="num" role="status">
              {view === "calendar" ? `${shown.length} из ${items.length}` : issues(shown.length)}
            </span>
          </p>
        )}
      </div>

      {view === "calendar" ? (
        <Calendar items={items} tomorrow={tomorrow} today={today} match={match} />
      ) : empty ? (
        <div className={styles.empty}>
          <p className="t-title2">{filter === "unread" ? "Всё прочитано" : "Ничего не нашлось"}</p>
          <p className="t-sub">{filter === "unread" ? "Новый выпуск откроется в полночь." : "Попробуйте другой фильтр."}</p>
          <button type="button" className={styles.reset} onClick={() => setFilter("all")}>
            Показать все
          </button>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.key} className={styles.section} aria-labelledby={`m-${g.key}`}>
            <h2 className={`t-title2 ${styles.month}`} id={`m-${g.key}`}>
              {monthName(g.key)}
            </h2>
            {view === "covers" ? (
              <ul className={books.grid}>
                {g.tomorrow && <TomorrowTile item={g.tomorrow} />}
                {g.items.map((i) => (
                  <BookTile key={i.slug} item={i} today={i.issue === todayIssue} />
                ))}
              </ul>
            ) : (
              <ul className={books.list}>
                {g.tomorrow && <TomorrowRow item={g.tomorrow} />}
                {g.items.map((i) => (
                  <BookRow key={i.slug} item={i} today={i.issue === todayIssue} />
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </>
  );
}
