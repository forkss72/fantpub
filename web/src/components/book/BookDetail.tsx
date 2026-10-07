import { ViewTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Book } from "@/components/ui/Book";
import { SealedAuthor } from "@/components/ui/SealedAuthor";
import { CaretRight, SpeakerHigh } from "@/components/ui/icons";
import { getPublishedStories } from "@/lib/content";
import { toCard } from "@/lib/cards";
import { coverVars } from "@/lib/cover";
import { currentIssue, humanDate, plural } from "@/lib/date";
import type { CoverCredit, StoryCard, StoryMeta } from "@/lib/types";
import { BookTopBar } from "./BookTopBar";
import { ReadButton } from "./ReadButton";
import { Teaser } from "./Teaser";
import styles from "./BookDetail.module.css";

type Props = {
  story: StoryMeta;
  /** "page" = /kniga/[slug] on a hard load; "sheet" = the intercepted card over the current screen */
  variant: "page" | "sheet";
};

const LANGS: Record<string, string> = {
  en: "английский",
  fr: "французский",
  de: "немецкий",
  it: "итальянский",
  es: "испанский",
  pl: "польский",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** «Перевод FantPub» / «Перевод: Константин Бальмонт» / «Оригинал на русском» */
function edition(s: StoryMeta): string {
  if (s.translation === "original") return "Оригинал на русском";
  if (s.translation === "fantpub") return "Перевод FantPub";
  return `Перевод: ${s.translation.replace(/\s*\(.*\)\s*$/, "")}`;
}

const translator = (s: StoryMeta) => (s.translation === "fantpub" ? "Новый перевод FantPub, 2026" : s.translation);

/** "CC0 1.0 — Met Open Access (…)" → "CC0 1.0"; "Public domain (PD-Art…)" → «Общественное достояние» */
function licenseLabel(license: string): string {
  if (/^public domain mark/i.test(license)) return "Public Domain Mark 1.0";
  if (/^public domain/i.test(license)) return "Общественное достояние";
  return license.split(/\s+—\s+|\s*\(|;|,/)[0].trim();
}

/** "Alte Nationalgalerie, Berlin (image via Wikimedia Commons …)" → "Alte Nationalgalerie, Berlin" */
const museum = (c: CoverCredit) => c.museum.replace(/\s*\(image via[^)]*\)\s*$/i, "");

/** Mood and genres as chips, without saying the same thing twice. */
function chips(s: StoryMeta): string[] {
  const all = [s.mood, ...s.genres.map((g) => (g === "хоррор" ? "жуткое" : g))].filter(Boolean).map(cap);
  return [...new Set(all)];
}

/** Same mood first, then a shared genre, newest first; the open book excluded. */
function similar(story: StoryMeta, now: number): StoryCard[] {
  const others = getPublishedStories(now)
    .filter((s) => s.slug !== story.slug)
    .reverse();
  const score = (s: StoryMeta) => (s.mood === story.mood ? 2 : 0) + (s.genres.some((g) => story.genres.includes(g)) ? 1 : 0);
  return others
    .map((s, i) => ({ s, k: score(s) * 100 - i }))
    .sort((a, b) => b.k - a.k)
    .slice(0, 4)
    .map(({ s }) => toCard(s));
}

/**
 * Apple Books product page for one story: the cover on its own colour field, one primary action,
 * then Pabchik's single line, the teaser and the colophon on the plain canvas.
 * Used as the full page (`/kniga/[slug]`) and inside the intercepted sheet.
 */
export function BookDetail({ story, variant }: Props) {
  // server component re-rendered by ISR: "now" decides what is today and what is published
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const isToday = story.issue === currentIssue(now);
  const more = similar(story, now);
  const credit = story.cover.credit;
  const { slug } = story;
  const titleId = variant === "sheet" ? "book-sheet-title" : "book-title";
  const issueLine = isToday ? "Рассказ дня" : `Выпуск № ${story.issue}`;
  const words = `${story.words.toLocaleString("ru-RU")} ${plural(story.words, ["слово", "слова", "слов"])}`;
  const lang = LANGS[story.originalLang];

  return (
    <article className={styles.detail} data-variant={variant} data-seal={slug} style={coverVars(story.cover.colors)} aria-labelledby={titleId}>
      <BookTopBar slug={slug} title={story.title} minutes={story.minutes} variant={variant} />

      <header className={styles.field}>
        <div className={styles.fieldInner}>
          <ViewTransition name={`book-${slug}`} share={{ "open-book": "open-book", default: "book" }} default="none">
            <div className={styles.cover}>
              <Book cover={story.cover} title={story.title} issue={story.issue} width="var(--cover-w)" sizes="(min-width: 900px) 300px, min(50vw, 230px)" depth priority />
            </div>
          </ViewTransition>

          <div className={styles.info}>
            <h1 className={styles.title} id={titleId} data-seal-title>
              {story.title}
            </h1>
            <p className={styles.author}>
              <span className="reveal-only">
                <Link className={styles.authorLink} href={`/avtor/${story.author.slug}` as Route}>
                  {story.author.nameShort ?? story.author.name}, {story.year}
                  <CaretRight size={18} weight="bold" aria-hidden="true" />
                </Link>
              </span>
              <span className="blind-only">
                <SealedAuthor name={story.author.name} year={story.year} />
              </span>
            </p>
            <p className={styles.meta}>
              {cap(story.mood)} · {story.minutes} мин · {words} · {story.age}
            </p>

            <div className={styles.action}>
              <p className={styles.edition}>
                {issueLine}
                <span className={styles.editionSub}>
                  {humanDate(story.date)} · {edition(story)}
                </span>
              </p>
              <div className={styles.buttons}>
                <Link
                  className={`${styles.listen} press`}
                  href={`/rasskaz/${slug}?listen=1` as Route}
                  transitionTypes={["open-book"]}
                  aria-label={`Слушать «${story.title}»`}
                >
                  <SpeakerHigh size={20} weight="fill" aria-hidden="true" />
                  <span className={styles.listenText}>Слушать</span>
                </Link>
                <ReadButton slug={slug} className={`${styles.read} press`} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {story.hook && (
          <figure className={styles.pabchik}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 112px static avatar */}
            <img className={styles.avatar} src="/pabchik/avatar.webp" alt="" width={44} height={44} loading="lazy" decoding="async" />
            <blockquote className={styles.hook}>{story.hook}</blockquote>
            <figcaption className={styles.who}>Пабчик</figcaption>
          </figure>
        )}

        {story.teaser && (
          <section className={styles.section} aria-labelledby={`${titleId}-about`}>
            <h2 className="t-title2" id={`${titleId}-about`}>
              О рассказе
            </h2>
            <Teaser text={story.teaser} />
            <ul className={styles.chips} aria-label="Настроение и жанр">
              {chips(story).map((c) => (
                <li key={c} className={styles.chip}>
                  {c}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.section} aria-labelledby={`${titleId}-ed`}>
          <h2 className="t-title2" id={`${titleId}-ed`}>
            Об издании
          </h2>
          <dl className={styles.list}>
            <div className={styles.row}>
              <dt>Выпуск</dt>
              <dd className="num">
                № {story.issue}, {humanDate(story.date)} {story.date.slice(0, 4)}
              </dd>
            </div>
            {story.originalTitle && story.translation !== "original" && (
              <div className={styles.row}>
                <dt>Оригинал</dt>
                <dd>
                  <SealedAuthor name={`«${story.originalTitle}»`} year={lang ? `${story.year} · ${lang}` : story.year} mask="Откроется вместе с автором" />
                </dd>
              </div>
            )}
            {story.translation !== "original" && (
              <div className={styles.row}>
                <dt>Перевод</dt>
                <dd>{translator(story)}</dd>
              </div>
            )}
            {story.sourceUrl && (
              <div className={`${styles.row} reveal-only`}>
                <dt>Источник</dt>
                <dd>
                  <a className={styles.ext} href={story.sourceUrl} target="_blank" rel="noopener nofollow">
                    {story.sourceLabel ?? "Оригинал"}
                  </a>
                </dd>
              </div>
            )}
            <div className={styles.row}>
              <dt>Права</dt>
              <dd>Общественное достояние</dd>
            </div>
            <div className={styles.row}>
              <dt>Обложка</dt>
              <dd>
                <a className={styles.ext} href={credit.pageUrl} target="_blank" rel="noopener nofollow">
                  {credit.artist}, «{credit.title}», {credit.year}
                </a>
                <span className={styles.sub}>
                  {museum(credit)} ·{" "}
                  <a className={styles.ext} href={credit.licenseUrl} target="_blank" rel="noopener nofollow">
                    {licenseLabel(credit.license)}
                  </a>
                </span>
              </dd>
            </div>
          </dl>
        </section>

        {more.length > 0 && (
          <section className={styles.section} aria-labelledby={`${titleId}-more`}>
            <h2 className="t-title2" id={`${titleId}-more`}>
              Похожие
            </h2>
            <ul className={styles.shelf}>
              {more.map((c) => (
                <li key={c.slug}>
                  {/* inside the sheet the next book replaces this one: ✕ still closes in one tap */}
                  <Link className={styles.similar} href={`/kniga/${c.slug}` as Route} replace={variant === "sheet"} scroll={false}>
                    <Book cover={c.cover} title={c.title} issue={c.issue} width="var(--sim-w)" sizes="140px" />
                    <span className={styles.simTitle}>{c.title}</span>
                    <span className={styles.simMeta}>
                      {cap(c.mood)} · {c.minutes} мин
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
