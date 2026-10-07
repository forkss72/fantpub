"use client";

import { useEffect, useRef, useState, type MouseEvent, type Ref } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Book } from "@/components/ui/Book";
import { Countdown } from "@/components/ui/Countdown";
import { showHud } from "@/components/ui/Hud";
import { CaretRight, Check, Link as LinkIcon, PaperPlaneTilt, Quotes } from "@/components/ui/icons";
import { unsealCss } from "@/components/BlindStyle";
import type { FinishProps } from "@/components/reader/finish-props";
import { coverVars } from "@/lib/cover";
import { mskDayKey, plural } from "@/lib/date";
import { tick } from "@/lib/haptics";
import { shareOrCopy } from "@/lib/share";
import { getShelf, markRead, setGuess, useHydrated, useShelf, type ShelfState } from "@/lib/shelf";
import { SITE_URL } from "@/lib/site";
import { week } from "@/lib/stats";
import type { StoryCard, StoryMeta } from "@/lib/types";
import { About } from "./About";
import { Reactions } from "./Reactions";
import s from "./Finish.module.css";
import { BookTransition } from "@/components/book/BookTransition";

/**
 * static: the global seal CSS decides (first paint, or the story was already open);
 * guess / reveal: a sealed story's staged sequence, owned by this component from hydration on.
 * The reader marks the story read as «Конец» scrolls by; without the hand-off the seal would lift
 * under the reader's nose before they could answer.
 */
type Phase = "static" | "guess" | "reveal";
type Answer = { pick: string | null; right: boolean };

const HUD_KEY = "fantpub:goal-hud";

const todayProgress = (sh: ShelfState) => week(sh).find((d) => d.today)?.progress ?? 0;

/** One unread issue of the same mood, then one more unread, stable per story (no hydration drift). */
function pickNext(next: StoryCard[], mood: string, read: Record<string, number>, seed: number): StoryCard[] {
  const unread = next.filter((c) => !read[c.slug]);
  const first = unread.find((c) => c.mood === mood) ?? unread[0];
  const rest = unread.filter((c) => c !== first);
  return [first, rest[seed % Math.max(1, rest.length)]].filter((c): c is StoryCard => !!c);
}

export function Finish({ story, authors, tomorrow, next }: FinishProps) {
  const { slug, author } = story;
  const shelf = useShelf();
  const hydrated = useHydrated();
  const [phase, setPhase] = useState<Phase>("static");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const baseline = useRef<number | null>(null);

  const forced = hydrated && new URLSearchParams(window.location.search).get("z") === "1";
  const sealed = hydrated && (forced || (shelf.prefs.blind && !shelf.read[slug]));
  if (phase === "static" && sealed) setPhase("guess");
  const staged = phase !== "static";

  const decoys = authors.filter((a) => a.slug !== author.slug).slice(0, 2);
  const options = [...decoys];
  options.splice(story.issue % (decoys.length + 1), 0, author);

  // today's goal as it stood before this story: the HUD only celebrates the crossing
  useEffect(() => {
    baseline.current = todayProgress(getShelf());
  }, []);

  // Past the guess, the story counts as read even if it was left open: the reader leaves marking to us
  // while blind (marking lifts the seal), and our phase is sticky, so the guess stays where it is.
  // The goal HUD belongs to the «tomorrow» beat: after the reveal, when the share row scrolls in.
  const guessing = phase === "guess";
  useEffect(() => {
    const el = shareRef.current;
    if (!el || !hydrated) return;
    let t = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        markRead(slug);
        if (guessing) return;
        io.disconnect();
        t = window.setTimeout(() => {
          if ((baseline.current ?? 1) >= 1 || todayProgress(getShelf()) < 1) return;
          const day = mskDayKey();
          try {
            if (localStorage.getItem(HUD_KEY) === day) return;
            localStorage.setItem(HUD_KEY, day);
          } catch {}
          showHud("Цель на сегодня выполнена", "goal");
        }, 700);
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [hydrated, guessing, slug]);

  function reveal() {
    markRead(slug);
    // the riddle link keeps a read story sealed; once revealed, drop ?z=1 and lift the seal right away
    if (new URLSearchParams(window.location.search).get("z") === "1") {
      const url = new URL(window.location.href);
      url.searchParams.delete("z");
      history.replaceState(history.state, "", url.pathname + url.search + url.hash);
      const st = document.getElementById("fp-read");
      if (st) st.textContent = unsealCss(Object.keys(getShelf().read));
      window.dispatchEvent(new Event("fp:url"));
    }
    setPhase("reveal");
    requestAnimationFrame(() => revealRef.current?.focus({ preventScroll: true }));
  }

  function guess(pick: string) {
    if (answer) return;
    const right = pick === author.slug;
    setAnswer({ pick, right });
    setGuess(slug, right);
    tick(right ? 10 : 24);
    window.setTimeout(reveal, right ? 450 : 700);
  }

  function skip() {
    if (answer) return;
    setAnswer({ pick: null, right: false });
    reveal();
  }

  const verdict: boolean | null = answer ? (answer.pick ? answer.right : null) : hydrated && slug in shelf.guesses ? shelf.guesses[slug] : null;
  const entering = phase === "reveal" ? "" : undefined;
  const picks = pickNext(next, story.mood, hydrated ? shelf.read : {}, story.issue);

  return (
    <section className={s.root} style={coverVars(story.cover.colors)} data-seal={slug} aria-label="После финала">
      {/* 1–2 · the cover comes back with a frosted plate where the author goes; the guess stamps the name on it */}
      <div className={s.moment}>
        <div className={s.cover} data-enter={entering}>
          <Book cover={story.cover} width={120} />
          <span className={s.band} aria-hidden="true">
            <span className={s.bandTitle}>{story.title}</span>
            <span className={s.line2}>
              <span className={staged ? s.plateWrap : "blind-only"} data-out={entering}>
                <span className={s.plate} />
              </span>
              <span className={staged ? undefined : "reveal-only"} hidden={phase === "guess"}>
                <span className={s.stamp}>{author.nameShort ?? author.name}</span>
              </span>
            </span>
          </span>
        </div>

        <div className={staged ? undefined : "blind-only"} hidden={staged && phase !== "guess"}>
          <div className={s.guess}>
            <h2 className={s.question}>Кто это написал?</h2>
            <div className={s.options}>
              {options.map((a) => {
                const state = answer?.pick === a.slug ? (answer.right ? "right" : "wrong") : undefined;
                return (
                  <button
                    key={a.slug}
                    type="button"
                    className={s.option}
                    data-state={state}
                    aria-disabled={answer ? true : undefined}
                    onClick={() => guess(a.slug)}
                  >
                    {a.name}
                    {state === "right" && <Check size={20} weight="bold" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <button type="button" className={s.show} onClick={skip}>
              Показать
            </button>
            <p className="sr-only" role="status">
              {answer?.pick ? (answer.right ? "Верно" : "Не угадали") : ""}
            </p>
          </div>
        </div>

        {/* 2 · the reveal takes the guess's place under the same cover */}
        <div className={staged ? undefined : "reveal-only"} hidden={phase === "guess"}>
          <div className={s.reveal} ref={revealRef} tabIndex={-1} data-enter={entering}>
            {verdict !== null && (
              <p className={s.verdict} data-right={verdict ? "" : undefined}>
                {verdict ? (
                  <>
                    <Check size={16} weight="bold" aria-hidden="true" /> Вы угадали
                  </>
                ) : (
                  "Не угадали — бывает"
                )}
              </p>
            )}
            <h2 className={s.name}>
              <Link href={`/avtor/${author.slug}` as Route} className={s.nameLink}>
                {author.name}
              </Link>
              <span className={s.foil} aria-hidden="true">
                {author.name}
              </span>
            </h2>
            <p className={`${s.years} num`}>
              {author.born}–{author.died}
            </p>
            {author.bio && <p className={s.bio}>{author.bio}</p>}
          </div>
        </div>
      </div>

      {/* 3–4 · reactions and Pabchik's note may name the author too: they wait for the reveal */}
      <div className={staged ? undefined : "reveal-only"} hidden={phase === "guess"}>
        <div className={s.after} data-enter={entering}>
          <Reactions slug={slug} />

          {story.note && <Note story={story} />}
        </div>
      </div>

      <Share story={story} ref={shareRef} quiet={phase === "guess"} />

      {(tomorrow || picks.length > 0) && (
        <section className={s.next} aria-labelledby={`next-${slug}`}>
          <h2 className={s.h} id={`next-${slug}`}>
            Дальше
          </h2>
          {tomorrow && (
            <div className={s.tomorrow}>
              <Book cover={{ ...tomorrow.cover, src: tomorrow.cover.srcSmall }} width={40} sealed />
              <p className={s.tomorrowText}>
                <span className={s.tomorrowTitle}>
                  Завтра · {tomorrow.mood}, {tomorrow.minutes} мин
                </span>
                <span className={`${s.tomorrowSub} num`}>
                  откроется через <Countdown target={tomorrow.opensAt} />
                </span>
              </p>
            </div>
          )}
          {picks.length > 0 && (
            <ul className={s.books}>
              {picks.map((c) => (
                <li key={c.slug}>
                  <Link href={`/kniga/${c.slug}` as Route} className={s.bookLink}>
                    <BookTransition slug={c.slug}>
                      <Book cover={c.cover} title={c.title} issue={c.issue} width="min(40vw, 168px)" />
                    </BookTransition>
                    <span className={s.bookTitle}>{c.title}</span>
                    <span className={`${s.bookMeta} num`}>
                      № {c.issue} · {c.mood}, {c.minutes} мин
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <About story={story} masked={phase === "guess"} />
    </section>
  );
}

function Note({ story }: { story: StoryMeta }) {
  const n = story.facts.length;
  return (
    <aside className={s.note} aria-labelledby={`note-${story.slug}`}>
      <div className={s.noteHead}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 64px avatar, pre-sized webp */}
        <img className={s.avatar} src="/pabchik/avatar.webp" alt="" width={32} height={32} loading="lazy" decoding="async" />
        <h2 className={s.noteTitle} id={`note-${story.slug}`}>
          Записка Пабчика
        </h2>
      </div>
      <p className={s.noteText}>{story.note}</p>
      {n > 0 && (
        <details className={s.facts}>
          <summary>
            {n === 1 ? "Ещё один факт" : `Ещё ${n} ${plural(n, ["факт", "факта", "фактов"])}`}
            <CaretRight size={14} weight="bold" aria-hidden="true" />
          </summary>
          <ol>
            {story.facts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ol>
        </details>
      )}
    </aside>
  );
}

function Share({ story, ref, quiet }: { story: StoryMeta; ref: Ref<HTMLDivElement>; quiet?: boolean }) {
  const { slug, title, minutes } = story;
  const url = `${SITE_URL}/rasskaz/${slug}`;
  const card = `/rasskaz/${slug}/karta`;

  // phones with file sharing get the picture itself; everyone else opens it in a new tab
  async function shareCard(e: MouseEvent<HTMLAnchorElement>) {
    if (!matchMedia("(pointer: coarse)").matches || !navigator.canShare) return;
    e.preventDefault();
    try {
      const blob = await fetch(card).then((r) => (r.ok ? r.blob() : Promise.reject()));
      const file = new File([blob], `fantpub-${slug}.png`, { type: blob.type || "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `«${title}»` });
        return;
      }
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
    }
    window.open(card, "_blank", "noopener");
  }

  return (
    <div className={s.share} ref={ref}>
      <button
        type="button"
        className={`${s.cap} ${s.capPrimary} press`}
        data-quiet={quiet ? "" : undefined}
        onClick={() => shareOrCopy(`${url}?z=1`, `«${title}»`, `«${title}» — рассказ на ${minutes} мин. Угадаете автора?`)}
      >
        <PaperPlaneTilt size={20} aria-hidden="true" />
        Загадка для друга
      </button>
      <button type="button" className={`${s.cap} press`} onClick={() => shareOrCopy(url, `«${title}»`, `«${title}» — рассказ на ${minutes} мин в FantPub`)}>
        <LinkIcon size={20} aria-hidden="true" />
        Ссылка
      </button>
      <a className={`${s.cap} press`} href={card} target="_blank" rel="noopener" onClick={shareCard}>
        <Quotes size={20} aria-hidden="true" />
        Карточка
      </a>
      <p className={s.shareNote}>В загадке автор скрыт — друг узнает его в конце.</p>
    </div>
  );
}
