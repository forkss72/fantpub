import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { getAuthors, getPublishedStories, getStory } from "@/lib/content";
import { toCard } from "@/lib/cards";
import { humanDate, issueOpensAt } from "@/lib/date";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Cover } from "@/components/Cover";
import { PabchikSays } from "@/components/Pabchik";
import { ReaderBar } from "@/components/reader/ReaderBar";
import { ReadingTracker } from "@/components/reader/ReadingTracker";
import { BlindGate } from "@/components/reader/BlindGate";
import { QuoteShare } from "@/components/reader/QuoteShare";
import { EndOfStory } from "@/components/reader/EndOfStory";
import { Colophon } from "@/components/reader/Colophon";
import { StoryText } from "@/components/reader/StoryText";
import { StoryCardLink } from "@/components/StoryCardLink";
import type { Story } from "@/lib/types";
import styles from "./page.module.css";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return getPublishedStories().map((s) => ({ slug: s.slug }));
}

function translationLabel(s: Story): string {
  if (s.translation === "original") return "";
  if (s.translation === "fantpub") return "новый перевод FantPub";
  return `перевод: ${s.translation}`;
}

export async function generateMetadata({ params }: PageProps<"/rasskaz/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getStory(slug);
  if (!s) return { title: "Рассказ не найден", robots: { index: false } };
  const isTranslation = s.translation !== "original";
  return {
    title: `${s.title} — ${s.author.name}: ${isTranslation && s.translation === "fantpub" ? "новый перевод" : "читать рассказ"}, ${s.minutes} мин`,
    description: `${s.hook} ${s.author.name}, ${s.year}. ${s.minutes} минут чтения и записка Пабчика после финала.`.slice(0, 200),
    alternates: { canonical: `/rasskaz/${s.slug}` },
    openGraph: {
      type: "article",
      // No author in the share title: every link doubles as a riddle.
      title: `«${s.title}» — рассказ на ${s.minutes} мин`,
      description: `${s.hook} Угадаете автора?`,
      publishedTime: new Date(issueOpensAt(s.issue)).toISOString(),
      url: `${SITE_URL}/rasskaz/${s.slug}`,
    },
    twitter: { card: "summary_large_image", title: `«${s.title}» — рассказ на ${s.minutes} мин` },
  };
}

export default async function StoryPage({ params }: PageProps<"/rasskaz/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const published = getPublishedStories();
  const authors = Object.values(getAuthors());
  const idx = published.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? published[idx - 1] : null;
  const next = idx >= 0 && idx < published.length - 1 ? published[idx + 1] : null;
  const isToday = idx === published.length - 1;

  // three-way riddle: the real author + two plausible decoys, stable per story
  const decoys = authors
    .filter((a) => a.slug !== story.author.slug)
    .sort((a, b) => Math.abs(a.born - story.author.born) - Math.abs(b.born - story.author.born) || a.slug.localeCompare(b.slug))
    .slice(0, 4);
  const pick = [decoys[story.issue % decoys.length], decoys[(story.issue + 1) % decoys.length]].filter(Boolean);
  const options = [story.author, ...pick]
    .filter((a, i, arr) => arr.findIndex((x) => x.slug === a.slug) === i)
    .map((a) => ({ slug: a.slug, name: a.name }))
    .sort((a, b) => ((a.slug.charCodeAt(1) + story.issue) % 7) - ((b.slug.charCodeAt(1) + story.issue) % 7));

  const sameAuthor = published.filter((s) => s.author.slug === story.author.slug && s.slug !== slug).slice(-2);
  const sameMood = published
    .filter((s) => s.slug !== slug && s.author.slug !== story.author.slug && (s.mood === story.mood || s.genres.some((g) => story.genres.includes(g))))
    .slice(-3);
  const suggestions = [...sameAuthor, ...sameMood].slice(0, 3).map(toCard);
  const short = published.filter((s) => s.slug !== slug && s.minutes <= 6).map(toCard);

  const paragraphs = story.blocks.filter((b) => b.type === "p").length;
  const tr = translationLabel(story);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ShortStory",
        "@id": `${SITE_URL}/rasskaz/${story.slug}#story`,
        name: story.title,
        inLanguage: "ru",
        url: `${SITE_URL}/rasskaz/${story.slug}`,
        datePublished: story.date,
        wordCount: story.words,
        timeRequired: `PT${story.minutes}M`,
        genre: story.genres,
        author: { "@type": "Person", name: story.author.name, birthDate: String(story.author.born), deathDate: String(story.author.died) },
        ...(story.originalTitle
          ? {
              translationOfWork: {
                "@type": "CreativeWork",
                name: story.originalTitle,
                datePublished: String(story.year),
                inLanguage: story.originalLang,
              },
              translator: story.translation === "fantpub" ? { "@type": "Organization", name: SITE_NAME } : { "@type": "Person", name: story.translation },
            }
          : { dateCreated: String(story.year) }),
        isAccessibleForFree: true,
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Архив", item: `${SITE_URL}/arhiv` },
          { "@type": "ListItem", position: 2, name: story.author.name, item: `${SITE_URL}/avtor/${story.author.slug}` },
          { "@type": "ListItem", position: 3, name: story.title, item: `${SITE_URL}/rasskaz/${story.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <BlindGate slug={story.slug} />
      <ReaderBar title={story.title} minutes={story.minutes} />
      <main className={styles.main}>
        <article className={styles.article} lang="ru">
          <header className={styles.head}>
            <div className={styles.thumb} aria-hidden="true">
              <Cover title={story.title} issue={story.issue} motif={story.motif} cloth={story.cloth} label="compact" />
            </div>
            <p className={`mono ${styles.kicker}`}>
              № {story.issue} · {humanDate(story.date)} · {story.genres.map((g) => (g === "хоррор" ? "жуткое" : g)).join(", ")}
            </p>
            <h1 className={`display ${styles.title}`}>{story.title}</h1>
            <p className={styles.byline}>
              <span className="fp-author-real">
                <Link href={`/avtor/${story.author.slug}` as Route}>{story.author.name}</Link>
                {" · "}
                {story.year}
                {tr && <> · {tr}</>}
              </span>
              <span className="fp-author-sealed">
                <span className={styles.dots} aria-hidden="true">
                  ●●●●●● ●●●●●
                </span>{" "}
                автор и год под печатью — узнаете в конце
              </span>
            </p>
            <p className={`mono ${styles.meta}`}>
              {story.minutes} мин · {story.words.toLocaleString("ru-RU")} слов · {story.age}
            </p>
            {story.hook && (
              <div className={styles.hook}>
                <PabchikSays pose="reading">{story.hook}</PabchikSays>
              </div>
            )}
          </header>

          <StoryText blocks={story.blocks} />

          <EndOfStory
            slug={story.slug}
            issue={story.issue}
            title={story.title}
            author={{ slug: story.author.slug, name: story.author.name, born: story.author.born, died: story.author.died }}
            year={story.year}
            note={story.note}
            facts={story.facts}
            minutes={story.minutes}
            options={options}
            isToday={isToday}
            nextOpensAt={isToday ? issueOpensAt(story.issue + 1) : null}
            shortPicks={short.slice(-8)}
          />

          <Colophon story={story} />
        </article>

        {suggestions.length > 0 && (
          <section className={styles.more} aria-labelledby="more">
            <h2 id="more" className={styles.moreTitle}>
              Похожее по настроению
            </h2>
            <div className={styles.moreGrid}>
              {suggestions.map((c) => (
                <StoryCardLink key={c.slug} card={c} />
              ))}
            </div>
          </section>
        )}

        <nav className={styles.pager} aria-label="Соседние выпуски">
          {prev ? (
            <Link href={`/rasskaz/${prev.slug}` as Route} className={styles.pagerLink}>
              <span className="mono">← № {prev.issue}</span>
              <span>{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/rasskaz/${next.slug}` as Route} className={`${styles.pagerLink} ${styles.pagerNext}`}>
              <span className="mono">№ {next.issue} →</span>
              <span>{next.title}</span>
            </Link>
          ) : (
            <Link href="/arhiv" className={`${styles.pagerLink} ${styles.pagerNext}`}>
              <span className="mono">Архив →</span>
              <span>Все выпуски</span>
            </Link>
          )}
        </nav>
      </main>
      <ReadingTracker slug={story.slug} paragraphs={paragraphs} minutes={story.minutes} />
      <QuoteShare slug={story.slug} title={story.title} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
