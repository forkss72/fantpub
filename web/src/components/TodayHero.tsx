"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { Book3D, type BookPhase } from "./Book3D";
import { Seal } from "./Seal";
import { PabchikSays } from "./Pabchik";
import { markOpened, updateShelf, useHydrated, useShelf } from "@/lib/shelf";
import { humanDate } from "@/lib/date";
import type { StoryCard } from "@/lib/types";
import { CLOTHS } from "@/lib/cloth";
import styles from "./TodayHero.module.css";

type Props = {
  story: StoryCard & { hook: string; paragraphs: number };
  dayIndex: number;
  /** Short unread alternative for «Другой на сегодня». */
  alternatives: { slug: string; title: string; minutes: number }[];
};

export function TodayHero({ story, dayIndex, alternatives }: Props) {
  const router = useRouter();
  const shelf = useShelf();
  const hydrated = useHydrated();
  const [phase, setPhase] = useState<BookPhase>("rest");
  const [breaking, setBreaking] = useState(false);
  const running = useRef(false);
  const timers = useRef<number[]>([]);

  const opened = hydrated && !!shelf.opened[story.slug];
  const read = hydrated && !!shelf.read[story.slug];
  const blind = !hydrated || (shelf.prefs.blind && !read);
  const progress = shelf.progress[story.slug] ?? 0;
  const href = `/rasskaz/${story.slug}` as Route;

  const sealState = !hydrated ? "pending" : breaking ? "broken" : opened ? "gone" : "whole";

  useEffect(() => {
    router.prefetch(href);
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [router, href]);

  function go() {
    try {
      if (shelf.prefs.blind && !shelf.read[story.slug]) sessionStorage.setItem("fantpub:blind", story.slug);
      else sessionStorage.removeItem("fantpub:blind");
    } catch {}
    router.push(href);
  }

  function open() {
    if (running.current) {
      timers.current.forEach(clearTimeout);
      go();
      return;
    }
    running.current = true;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const firstTimeToday = !opened;
    markOpened(story.slug);
    if (reduce) return go();

    if (firstTimeToday) {
      updateShelf((s) => ({ ...s, ritualDay: dayIndex }));
      navigator.vibrate?.(14);
      setBreaking(true);
      timers.current.push(window.setTimeout(() => setPhase("front"), 420));
      timers.current.push(window.setTimeout(() => setPhase("open"), 940));
      timers.current.push(window.setTimeout(go, 1760));
    } else {
      setPhase("open");
      timers.current.push(window.setTimeout(go, 620));
    }
  }

  const remaining = progress > 0 && !read ? Math.max(1, Math.round(story.minutes * (1 - progress / Math.max(1, story.paragraphs)))) : null;
  const cta = !opened
    ? { label: "Сломать печать", meta: `${story.minutes} мин` }
    : read
      ? { label: "Перечитать", meta: `${story.minutes} мин` }
      : remaining
        ? { label: "Продолжить", meta: `ещё ~${remaining} мин` }
        : { label: "Читать", meta: `${story.minutes} мин` };

  const alt = alternatives.find((a) => !shelf.read[a.slug]) ?? alternatives[0];

  return (
    <section className={styles.hero} aria-labelledby="today-title">
      <div className={styles.stageWrap} data-phase={phase} style={{ "--spot": (CLOTHS[story.cloth] ?? CLOTHS.forest).bg } as React.CSSProperties}>
        <div className={styles.spot} aria-hidden="true" />
        <div className={styles.gobo} aria-hidden="true" />
        <button
          type="button"
          className={styles.bookButton}
          onClick={open}
          aria-label={opened ? `Открыть рассказ «${story.title}»` : `Сломать печать и открыть рассказ «${story.title}»`}
        >
          <Book3D
            title={story.title}
            issue={story.issue}
            motif={story.motif}
            cloth={story.cloth}
            phase={phase}
            width={208}
            titlePage={<TitlePage story={story} blind={blind} />}
          >
            <span className={styles.ribbon} data-state={sealState} aria-hidden="true" />
            <Seal issue={story.issue} size={92} state={sealState} className={styles.seal} />
          </Book3D>
        </button>
        <div className={styles.ledge} aria-hidden="true" />
        <p className={styles.hint} data-visible={sealState === "whole"} aria-hidden="true">
          нажмите на печать
        </p>
      </div>

      <div className={styles.info}>
        <p className={`mono ${styles.kicker}`}>
          Выпуск № {story.issue} · {humanDate(story.date)}
        </p>
        <h1 id="today-title" className={`display ${styles.title}`}>
          {story.title}
        </h1>
        <p className={styles.byline}>
          {blind ? (
            <>
              <span className={styles.sealedDot} aria-hidden="true" /> Автор и год — под печатью
            </>
          ) : (
            <>
              <Link href={`/avtor/${story.authorSlug}` as Route}>{story.authorName}</Link> · {story.year}
            </>
          )}
        </p>
        <div className={styles.tags}>
          {story.genres.slice(0, 2).map((g) => (
            <span key={g} className="tag">
              {g === "хоррор" ? "жуткое" : g}
            </span>
          ))}
          <span className="tag">{story.minutes} мин</span>
          <span className="tag">{story.age}</span>
        </div>

        <div className={styles.says}>
          <PabchikSays pose="sealed-book">{story.hook}</PabchikSays>
        </div>

        <div className={styles.actions}>
          <button type="button" className="pill" onClick={open}>
            {cta.label} <span className="pill__meta">{cta.meta}</span>
          </button>
          {alt && alt.slug !== story.slug && (
            <Link href={`/rasskaz/${alt.slug}` as Route} className={styles.altLink}>
              Другой на сегодня: «{alt.title}», {alt.minutes} мин
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function TitlePage({ story, blind }: { story: Props["story"]; blind: boolean }) {
  return (
    <div className={styles.titlePage}>
      <span className={styles.tpPublisher}>FantPub · № {story.issue}</span>
      <span className={styles.tpRule} aria-hidden="true" />
      <span className={styles.tpTitle}>{story.title}</span>
      <span className={styles.tpAuthor}>{blind ? "автор под печатью" : story.authorName}</span>
      <span className={styles.tpOrn} aria-hidden="true">
        ✦
      </span>
      <span className={styles.tpMeta}>
        {humanDate(story.date)} · {story.minutes} мин
      </span>
    </div>
  );
}
