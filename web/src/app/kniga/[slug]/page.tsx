import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getPublishedStories, getStory } from "@/lib/content";
import { issueOpensAt } from "@/lib/date";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { BookDetail } from "@/components/book/BookDetail";
import styles from "./page.module.css";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return getPublishedStories().map((s) => ({ slug: s.slug }));
}

/** Cut at a word boundary so the snippet never ends mid-word. */
function snippet(text: string, max = 200): string {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max)).replace(/[\s,;:—-]+$/, "")}…`;
}

export async function generateMetadata({ params }: PageProps<"/kniga/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getStory(slug);
  if (!s) return { title: "Рассказ не найден", robots: { index: false } };
  // the visible title never names the author: every page doubles as a riddle
  const shareTitle = `«${s.title}» — рассказ на ${s.minutes} мин`;
  const image = { url: `/rasskaz/${s.slug}/opengraph-image`, width: 1200, height: 630, alt: `«${s.title}»` };
  return {
    title: `«${s.title}» — рассказ дня № ${s.issue}`,
    description: snippet(s.teaser || s.hook),
    authors: [{ name: s.author.name }],
    alternates: { canonical: `/kniga/${s.slug}` },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "ru_RU",
      title: shareTitle,
      description: `${s.hook} Угадаете автора?`,
      publishedTime: new Date(issueOpensAt(s.issue)).toISOString(),
      url: `${SITE_URL}/kniga/${s.slug}`,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: shareTitle, images: [image.url] },
  };
}

/** The status bar takes the cover's colour (Chrome on Android; Safari samples the page). */
export async function generateViewport({ params }: PageProps<"/kniga/[slug]">): Promise<Viewport> {
  const { slug } = await params;
  const s = getStory(slug);
  return s ? { themeColor: s.cover.colors.bg } : {};
}

export default async function BookPage({ params }: PageProps<"/kniga/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const url = `${SITE_URL}/kniga/${story.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Book", "ShortStory"],
        "@id": `${url}#book`,
        name: story.title,
        url,
        inLanguage: "ru",
        description: story.teaser,
        image: `${SITE_URL}${story.cover.src}`,
        datePublished: story.date,
        wordCount: story.words,
        timeRequired: `PT${story.minutes}M`,
        genre: story.genres,
        bookFormat: "https://schema.org/EBook",
        isAccessibleForFree: true,
        author: { "@type": "Person", name: story.author.name, birthDate: String(story.author.born), deathDate: String(story.author.died) },
        ...(story.originalTitle && story.translation !== "original"
          ? {
              translationOfWork: { "@type": "CreativeWork", name: story.originalTitle, datePublished: String(story.year), inLanguage: story.originalLang },
              translator:
                story.translation === "fantpub"
                  ? { "@type": "Organization", name: SITE_NAME }
                  : { "@type": "Person", name: story.translation.replace(/\s*\(.*\)\s*$/, "") },
            }
          : { dateCreated: String(story.year) }),
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        workExample: { "@type": "ShortStory", url: `${SITE_URL}/rasskaz/${story.slug}`, name: story.title },
        potentialAction: { "@type": "ReadAction", target: `${SITE_URL}/rasskaz/${story.slug}` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Архив", item: `${SITE_URL}/arhiv` },
          { "@type": "ListItem", position: 2, name: story.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className={styles.main}>
      <BookDetail story={story} variant="page" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
