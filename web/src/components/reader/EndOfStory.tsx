"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { PabchikAvatar, Pabchik } from "../Pabchik";
import { Countdown } from "../Countdown";
import { InstallHint } from "../InstallHint";
import { getDeviceId, markRead, setGuess, setReaction, useHydrated, useShelf } from "@/lib/shelf";
import { EMPTY_COUNTS, REACTIONS, STATS_THRESHOLD, total, type Counts } from "@/lib/reactions";
import type { ReactionKey, StoryCard } from "@/lib/types";
import { SITE_URL } from "@/lib/site";
import { plural } from "@/lib/date";
import styles from "./EndOfStory.module.css";

type Props = {
  slug: string;
  issue: number;
  title: string;
  author: { slug: string; name: string; born: number; died: number };
  year: number;
  note: string;
  facts: string[];
  minutes: number;
  options: { slug: string; name: string }[];
  isToday: boolean;
  nextOpensAt: number | null;
  shortPicks: StoryCard[];
};

export function EndOfStory(props: Props) {
  const { slug, issue, title, author, year, note, facts, isToday, nextOpensAt, shortPicks } = props;
  const shelf = useShelf();
  const hydrated = useHydrated();
  const finRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [justRead, setJustRead] = useState(false);

  // reaching «Конец» marks the story as read
  useEffect(() => {
    const el = finRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!getRead()) setJustRead(true);
          markRead(slug);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
    function getRead() {
      try {
        return !!JSON.parse(localStorage.getItem("fantpub:v1") || "{}").read?.[slug];
      } catch {
        return false;
      }
    }
  }, [slug]);

  // Blind state lives on <html data-blind> (set before paint), so CSS hides/shows
  // the riddle, the reveal and the note even before hydration.
  /* eslint-disable react-hooks/immutability -- the seal is page-level DOM state (<html data-blind>, document.title) */
  function unseal() {
    document.documentElement.dataset.blind = "0";
    try {
      sessionStorage.removeItem("fantpub:blind");
    } catch {}
    const real = document.documentElement.dataset.realTitle;
    if (real) document.title = real;
    if (location.search.includes("z=1")) history.replaceState(history.state, "", location.pathname);
    window.setTimeout(() => revealRef.current?.focus({ preventScroll: false }), 60);
  }
  /* eslint-enable react-hooks/immutability */

  function guess(choice: string) {
    const right = choice === author.slug;
    setAnswer(choice);
    setGuess(slug, right);
    navigator.vibrate?.(right ? [10, 40, 10] : 18);
    window.setTimeout(unseal, 900);
  }

  const readCount = hydrated ? Object.keys(shelf.read).length : 0;
  const alt = shortPicks.find((c) => c.slug !== slug && !(hydrated && shelf.read[c.slug])) ?? shortPicks.find((c) => c.slug !== slug);

  return (
    <section className={styles.end} aria-label="После финала">
      <div ref={finRef} className={styles.fin}>
        <span className={styles.finRule} aria-hidden="true" />
        <span className={styles.finWord}>Конец</span>
        <span className={styles.finRule} aria-hidden="true" />
        <span className={styles.stamp} data-show={justRead} aria-hidden="true">
          прочитано · № {issue}
        </span>
      </div>

      {/* 1 · the riddle (blind only) and the reveal (otherwise) — toggled by CSS on <html data-blind> */}
      <div className={`fp-blind-only ${styles.card} ${styles.guess}`}>
          <p className={`mono ${styles.kicker}`}>Печать ещё цела</p>
          <h2 className={styles.h}>Кто написал этот рассказ?</h2>
          <div className={styles.options}>
            {props.options.map((o) => {
              const state = answer === null ? undefined : o.slug === author.slug ? "right" : o.slug === answer ? "wrong" : "dim";
              return (
                <button key={o.slug} type="button" className={styles.option} data-state={state} disabled={answer !== null} onClick={() => guess(o.slug)}>
                  {o.name}
                </button>
              );
            })}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {answer === null ? "" : answer === author.slug ? "Верно!" : "Не угадали."}
          </p>
          <button type="button" className={styles.skip} onClick={unseal}>
            Просто покажите
          </button>
        </div>
      <div
        ref={revealRef}
        tabIndex={-1}
        className={`fp-reveal-only ${styles.card} ${styles.reveal}`}
        data-answered={answer !== null || (hydrated && slug in shelf.guesses)}
      >
          <span className={styles.brokenSeal} aria-hidden="true" />
          <div>
            <p className={`mono ${styles.kicker}`}>
              {answer !== null || (hydrated && slug in shelf.guesses)
                ? (answer ? answer === author.slug : shelf.guesses[slug])
                  ? "Вы угадали"
                  : "Не угадали — это нормально"
                : "Печать сломана"}
            </p>
            <p className={styles.revealText}>
              Автор —{" "}
              <Link href={`/avtor/${author.slug}` as Route} className={styles.authorLink}>
                {author.name}
              </Link>
              , {year}
            </p>
            <p className={styles.years}>
              {author.born}–{author.died}
            </p>
          </div>
        </div>

      {/* 2 · one-tap reaction + honest stats */}
      <Reactions slug={slug} />

      {/* 3 · Pabchik's note */}
      {note && (
        <aside className={`fp-reveal-only ${styles.note}`} aria-labelledby={`note-${slug}`}>
          <p className={`mono ${styles.noteHead}`} id={`note-${slug}`}>
            Записка Пабчика · № {issue}
          </p>
          <p className={styles.noteText}>{note}</p>
          {facts.length > 0 && (
            <details className={styles.facts}>
              <summary>
                Ещё {facts.length === 1 ? "один факт" : facts.length < 5 ? `${facts.length} факта` : `${facts.length} фактов`}
              </summary>
              <ol>
                {facts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ol>
            </details>
          )}
          <footer className={styles.sign}>
            <PabchikAvatar size={34} pose="explaining" />
            <span className={styles.signName}>Пабчик</span>
            <span className={`mono ${styles.signRole}`}>домовой FantPub</span>
          </footer>
        </aside>
      )}

      {/* 4 · share */}
      <Share slug={slug} title={title} minutes={props.minutes} />

      {/* 5 · what's next */}
      <div className={styles.next}>
        {isToday && nextOpensAt && (
          <div className={styles.tomorrow}>
            <Pabchik pose="sleeping" size={96} />
            <div>
              <p className={styles.tomorrowTitle}>На сегодня всё</p>
              <p className={styles.tomorrowText}>
                Следующий выпуск откроется через <Countdown target={nextOpensAt} />. Я уже запечатываю.
              </p>
            </div>
          </div>
        )}
        {alt && (
          <Link href={`/rasskaz/${alt.slug}` as Route} className={styles.alt}>
            <span className="mono">Ещё один на {alt.minutes} мин</span>
            <span className={styles.altTitle}>{alt.title}</span>
            <span className={styles.altArrow} aria-hidden="true">
              →
            </span>
          </Link>
        )}
        <Link href="/polka" className={styles.toShelf}>
          {readCount > 0 ? `На вашей полке ${readCount} ${plural(readCount, ["книга", "книги", "книг"])}` : "Ваша полка"} <span aria-hidden="true">→</span>
        </Link>
        {readCount >= 3 && <InstallHint />}
      </div>
    </section>
  );
}

function Reactions({ slug }: { slug: string }) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const mine = hydrated ? shelf.reactions[slug] : undefined;
  const [counts, setCounts] = useState<Counts | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/reactions/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { counts: Counts; enabled: boolean }) => {
        if (!alive) return;
        if (d.enabled) setCounts(d.counts);
        else setFailed(true);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  async function vote(key: ReactionKey) {
    const prev = mine ?? null;
    if (prev === key) return;
    setReaction(slug, key);
    navigator.vibrate?.(8);
    setCounts((c) => {
      const n = { ...(c ?? EMPTY_COUNTS) };
      n[key] += 1;
      if (prev) n[prev] = Math.max(0, n[prev] - 1);
      return n;
    });
    try {
      const r = await fetch(`/api/reactions/${slug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reaction: key, prev, device: getDeviceId() }),
      });
      const d = r.ok ? ((await r.json()) as { counts: Counts; enabled: boolean }) : null;
      if (d?.enabled) {
        setCounts(d.counts);
        setFailed(false);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    }
  }

  const t = counts ? total(counts) : 0;
  const showStats = mine && counts && t >= STATS_THRESHOLD;
  const top = counts && showStats ? REACTIONS.map((r) => ({ ...r, n: counts[r.key] })).sort((a, b) => b.n - a.n)[0] : null;

  return (
    <div className={`${styles.card} ${styles.reactions}`}>
      <h2 className={styles.h}>Как вам финал?</h2>
      <div className={styles.reactionGrid} role="group" aria-label="Реакция на рассказ">
        {REACTIONS.map((r) => {
          const pct = showStats && counts ? Math.round((counts[r.key] / t) * 100) : null;
          return (
            <button key={r.key} type="button" className={styles.reaction} aria-pressed={mine === r.key} onClick={() => vote(r.key)} data-key={r.key}>
              <span className={styles.glyph} aria-hidden="true">
                {r.glyph}
              </span>
              <span className={styles.reactionLabel}>{r.label}</span>
              {pct !== null && (
                <span className={styles.bar} style={{ "--pct": `${pct}%` } as React.CSSProperties}>
                  <span className="mono">{pct}%</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {mine && (
        <p className={styles.statLine} role="status">
          {showStats && top
            ? `${Math.round((top.n / t) * 100)}% читателей — ${top.stat}.`
            : failed
              ? "Реакция сохранена на вашей полке. Общий счётчик читателей включим совсем скоро."
              : `Спасибо, голос учтён. Пока голосов ${Math.max(t, 1)} — проценты покажем, когда их станет ${STATS_THRESHOLD}.`}
        </p>
      )}
    </div>
  );
}

function Share({ slug, title, minutes }: { slug: string; title: string; minutes: number }) {
  const [copied, setCopied] = useState<string | null>(null);
  const url = `${SITE_URL}/rasskaz/${slug}`;
  const riddle = `${url}?z=1`;

  async function share(kind: "link" | "riddle") {
    const target = kind === "riddle" ? riddle : url;
    const text = kind === "riddle" ? `«${title}» — рассказ на ${minutes} мин. Угадаете автора?` : `«${title}» — рассказ на ${minutes} мин в FantPub`;
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: `«${title}»`, text, url: target });
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${target}`);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2200);
    } catch {}
  }

  return (
    <div className={styles.share}>
      <h2 className={styles.hSmall}>Поделиться без спойлеров</h2>
      <div className={styles.shareRow}>
        <button type="button" className="pill" onClick={() => share("riddle")}>
          {copied === "riddle" ? "Ссылка скопирована" : "Загадка для друга"}
        </button>
        <button type="button" className="pill pill--ghost" onClick={() => share("link")}>
          {copied === "link" ? "Скопировано" : "Ссылка"}
        </button>
        <a
          className="pill pill--ghost"
          href={`https://vk.com/share.php?url=${encodeURIComponent(`${url}?utm_source=vk`)}&title=${encodeURIComponent(`«${title}» — рассказ на ${minutes} мин`)}`}
          target="_blank"
          rel="noopener"
        >
          ВКонтакте
        </a>
        <a className="pill pill--ghost" href={`/rasskaz/${slug}/karta`} target="_blank" rel="noopener">
          Карточка
        </a>
      </div>
      <p className={styles.shareNote}>В загадке автор спрятан — друг узнает его только в конце.</p>
    </div>
  );
}
