import type { Metadata } from "next";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { getAuthors, getPublishedStories, getStory, getTomorrowTeaser, toMeta } from "@/lib/content";
import { toCard } from "@/lib/cards";
import { currentIssue, issueOpensAt, plural } from "@/lib/date";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { StoryText } from "@/components/reader/StoryText";
import { Reader } from "@/components/reader/Reader";
import { PaperTransition } from "@/components/reader/PaperTransition";
import { SelectionPill } from "@/components/reader/SelectionPill";
import { Finish } from "@/components/finish/Finish";
import type { FinishProps } from "@/components/reader/finish-props";
import type { Author, Story } from "@/lib/types";
import styles from "./page.module.css";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return getPublishedStories().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/rasskaz/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getStory(slug);
  if (!s) return { title: "Рассказ не найден", robots: { index: false } };
  const isTranslation = s.translation !== "original";
  return {
    // no author in the tab title: blind reading would be spoiled before the guess (crawlers get it below)
    title: `«${s.title}» — ${isTranslation && s.translation === "fantpub" ? "новый перевод" : "читать рассказ"}, ${s.minutes} мин`,
    description: `${s.hook} ${s.author.name}, ${s.year}. ${s.minutes} ${plural(s.minutes, ["минута", "минуты", "минут"])} чтения и записка Пабчика после финала.`.slice(0, 200),
    alternates: { canonical: `/rasskaz/${s.slug}` },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "ru_RU",
      // No author in the share title: every link doubles as a riddle.
      title: `«${s.title}» — рассказ на ${s.minutes} мин`,
      description: `${s.hook} Угадаете автора?`,
      publishedTime: new Date(issueOpensAt(s.issue)).toISOString(),
      url: `${SITE_URL}/rasskaz/${s.slug}`,
    },
    twitter: { card: "summary_large_image", title: `«${s.title}» — рассказ на ${s.minutes} мин` },
  };
}

/** Two plausible decoys for «Кто это написал?»: same era first, same country a little closer. Stable per story. */
function distractors(story: Story, authors: Author[]): Author[] {
  const near = authors
    .filter((a) => a.slug !== story.author.slug)
    .map((a) => ({ a, d: Math.abs(a.born - story.author.born) + (a.country === story.author.country ? 0 : 15) }))
    .sort((x, y) => x.d - y.d || x.a.slug.localeCompare(y.a.slug))
    .slice(0, 4)
    .map((x) => x.a);
  return [...new Set([near[story.issue % near.length], near[(story.issue + 1) % near.length]])].filter(Boolean);
}

export default async function StoryPage({ params }: PageProps<"/rasskaz/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  // server component re-rendered by ISR: "now" decides which issues are published
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const published = getPublishedStories(now);
  const teaser = story.issue === currentIssue(now) ? getTomorrowTeaser(now) : null;
  const opensAt = teaser ? issueOpensAt(teaser.issue) : 0;

  const others = published.filter((s) => s.slug !== slug).reverse();
  const next = [...others.filter((s) => s.mood === story.mood), ...others.filter((s) => s.mood !== story.mood)].slice(0, 8).map(toCard);

  const finish: FinishProps = {
    story: toMeta(story),
    authors: distractors(story, Object.values(getAuthors())),
    tomorrow: teaser && opensAt > now ? { ...teaser, opensAt } : null,
    next,
  };

  const paragraphs = story.blocks.filter((b) => b.type === "p").length;

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
              translator:
                story.translation === "fantpub"
                  ? { "@type": "Organization", name: SITE_NAME }
                  : { "@type": "Person", name: story.translation.replace(/\s*\(.*\)\s*$/, "") },
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
      {/* the sheet's cover lands here and turns into paper (globals.css: .open-book) */}
      <PaperTransition slug={story.slug}>
        <div className={styles.paper} aria-hidden="true" />
      </PaperTransition>
      {/* fixed chrome first: Tab reaches ✕ · Aa · ••• before the text and the finish */}
      <Reader slug={story.slug} title={story.title} minutes={story.minutes} paragraphs={paragraphs} />
      <ViewTransition enter="page-in" default="none">
        <main className={styles.main} data-reader-page data-seal={story.slug}>
          <article className={styles.article} lang="ru" data-reader-article>
            <header className={styles.head}>
              <h1 className={styles.title} data-seal-title>
                {story.title}
              </h1>
              <span className={styles.rule} aria-hidden="true" />
            </header>
            <StoryText blocks={story.blocks} />
            <p className={styles.end} data-end-mark>
              Конец
            </p>
          </article>
          <Finish {...finish} />
        </main>
      </ViewTransition>
      <SelectionPill slug={story.slug} title={story.title} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
