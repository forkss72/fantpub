"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sheet } from "@/components/ui/Sheet";
import { ArrowRight, CaretRight } from "@/components/ui/icons";
import { setProfile, useHydrated, useShelf, type ShelfState } from "@/lib/shelf";
import { achievements, guessScore, totalMinutes } from "@/lib/stats";
import { plural } from "@/lib/date";
import { VK_URL } from "@/lib/site";
import type { StoryCard } from "@/lib/types";
import { AVATAR_POSES, Avatar, POSE_NAMES } from "./Avatar";
import { Goals } from "./Goals";
import { Group } from "./Group";
import { Medals } from "./Medals";
import { Settings } from "./Settings";
import { Transfer } from "./Transfer";
import styles from "./Profile.module.css";
import p from "./ProfileScreen.module.css";

export function ProfileScreen({ cards }: { cards: StoryCard[] }) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const name = hydrated ? shelf.profile.name.trim() : "";

  return (
    <main className={`page ${styles.page}`}>
      <PageHeader title={name || "Профиль"} />
      {hydrated ? <Body shelf={shelf} cards={cards} /> : <div className={styles.placeholder} aria-busy="true" />}
    </main>
  );
}

function Body({ shelf, cards }: { shelf: ShelfState; cards: StoryCard[] }) {
  const bySlug = new Map(cards.map((c) => [c.slug, c]));

  // the content mounts after hydration, so the browser's own jump to #goals has nothing to land on yet
  useEffect(() => {
    const el = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    el?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div className={styles.columns}>
      <div className={styles.stack}>
        <Identity shelf={shelf} />
        <Goals shelf={shelf} cards={bySlug} />
        <Medals list={achievements(shelf)} />
        <Stats shelf={shelf} cards={bySlug} />
      </div>
      <div className={styles.stack}>
        <Settings prefs={shelf.prefs} />
        <Transfer shelf={shelf} />
        <About />
      </div>
    </div>
  );
}

function Identity({ shelf }: { shelf: ShelfState }) {
  const [pick, setPick] = useState(false);
  const { name, avatar } = shelf.profile;
  return (
    <>
      <Group footer="Имя и аватар видны только вам">
        <div className={`${styles.cell} ${p.identity}`}>
          <button type="button" className={`${p.avatarBtn} press`} onClick={() => setPick(true)} aria-label="Изменить аватар">
            <Avatar avatar={avatar} name={name} size={64} />
            <span className={p.edit} aria-hidden="true">
              Изменить
            </span>
          </button>
          <label className={p.name}>
            <span className={styles.sub}>Имя</span>
            <input
              className={styles.field}
              value={name}
              maxLength={40}
              placeholder="Как вас называть?"
              autoComplete="given-name"
              enterKeyHint="done"
              onChange={(e) => setProfile({ name: e.target.value })}
            />
          </label>
        </div>
      </Group>
      <Sheet open={pick} onClose={() => setPick(false)} title="Аватар">
        <div className={p.poses} role="radiogroup" aria-label="Аватар">
          {["", ...AVATAR_POSES].map((pose) => (
            <button
              key={pose || "initials"}
              type="button"
              role="radio"
              aria-checked={avatar === pose}
              aria-label={pose ? POSE_NAMES[pose] : "Инициалы"}
              className={`${p.pose} press`}
              onClick={() => {
                setProfile({ avatar: pose });
                setPick(false);
              }}
            >
              <Avatar avatar={pose} name={name} size={68} />
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}

function favouriteMood(read: StoryCard[]): string {
  const n = new Map<string, number>();
  for (const c of read) if (c.mood) n.set(c.mood, (n.get(c.mood) ?? 0) + 1);
  const top = [...n].sort((a, b) => b[1] - a[1])[0]?.[0];
  return top ? top[0].toUpperCase() + top.slice(1) : "—";
}

function duration(min: number): string {
  if (min < 60) return `${min} ${plural(min, ["минута", "минуты", "минут"])}`;
  const h = Math.floor(min / 60);
  return `${h} ч ${min % 60} мин`;
}

function Stats({ shelf, cards }: { shelf: ShelfState; cards: Map<string, StoryCard> }) {
  const read = Object.keys(shelf.read)
    .map((s) => cards.get(s))
    .filter((c): c is StoryCard => !!c);
  const count = Object.keys(shelf.read).length;
  const minutes = Math.max(
    totalMinutes(shelf.log),
    read.reduce((m, c) => m + c.minutes, 0),
  );
  const g = guessScore(shelf.guesses);
  const authors = new Set(read.map((c) => c.authorSlug)).size;
  const rows: [string, string][] = [
    ["Прочитано", `${count} ${plural(count, ["рассказ", "рассказа", "рассказов"])}`],
    ["Время чтения", duration(minutes)],
    ["Угадано авторов", g.total ? `${g.right} из ${g.total}` : "—"],
    ["Любимое настроение", favouriteMood(read)],
    ["Открыто авторов", String(authors)],
  ];
  return (
    <Group title="Статистика">
      <dl className={p.stats}>
        {rows.map(([k, v]) => (
          <div key={k} className={styles.row}>
            <dt className={styles.label}>{k}</dt>
            <dd className={styles.value}>{v}</dd>
          </div>
        ))}
      </dl>
    </Group>
  );
}

function About() {
  const chev = <CaretRight size={14} weight="bold" className={styles.chev} aria-hidden="true" />;
  return (
    <Group title="О проекте">
      <Link href="/o-proekte" className={styles.row}>
        <span className={styles.label}>О проекте</span>
        {chev}
      </Link>
      <Link href="/avtory" className={styles.row}>
        <span className={styles.label}>Авторы</span>
        {chev}
      </Link>
      <Link href="/o-proekte#prava" className={styles.row}>
        <span className={styles.label}>Права и переводы</span>
        {chev}
      </Link>
      <a href={VK_URL} className={styles.row} target="_blank" rel="noopener noreferrer">
        <span className={styles.label}>FantPub во ВКонтакте</span>
        <ArrowRight size={15} weight="bold" className={`${styles.chev} ${p.out}`} aria-hidden="true" />
      </a>
    </Group>
  );
}
