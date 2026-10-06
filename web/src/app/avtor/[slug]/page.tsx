import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { StoryCardLink } from "@/components/StoryCardLink";
import { PabchikSays } from "@/components/Pabchik";
import { SiteFooter } from "@/components/SiteFooter";
import { getAuthors, getStoriesByAuthor } from "@/lib/content";
import { toCard } from "@/lib/cards";
import { plural } from "@/lib/date";
import { SITE_URL } from "@/lib/site";
import styles from "./page.module.css";

export const revalidate = 3600;

export function generateStaticParams() {
  return Object.keys(getAuthors()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/avtor/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getAuthors()[slug];
  if (!a) return { title: "Автор не найден", robots: { index: false } };
  const n = getStoriesByAuthor(slug).length;
  return {
    title: `${a.name}: рассказы читать онлайн`,
    description: `${a.bio} ${n} ${plural(n, ["рассказ", "рассказа", "рассказов"])} в FantPub — с записками Пабчика и временем чтения.`,
    alternates: { canonical: `/avtor/${slug}` },
    robots: n >= 2 ? undefined : { index: false, follow: true },
  };
}

export default async function AuthorPage({ params }: PageProps<"/avtor/[slug]">) {
  const { slug } = await params;
  const author = getAuthors()[slug];
  if (!author) notFound();
  const stories = getStoriesByAuthor(slug).map(toCard).reverse();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    birthDate: String(author.born),
    deathDate: String(author.died),
    url: `${SITE_URL}/avtor/${slug}`,
  };
  return (
    <main className={`page ${styles.page}`}>
      <Masthead />
      <header className={styles.head}>
        <p className={`mono ${styles.kicker}`}>
          {author.country} · {author.born}–{author.died}
        </p>
        <h1 className={`display ${styles.title}`}>{author.name}</h1>
        <div className={styles.bio}>
          <PabchikSays pose="explaining">{author.bio}</PabchikSays>
        </div>
      </header>
      <section className={styles.list} aria-label="Рассказы">
        <h2 className={styles.h}>
          {stories.length} {plural(stories.length, ["рассказ", "рассказа", "рассказов"])} в FantPub
        </h2>
        {stories.length === 0 ? (
          <p className={styles.soon}>Рассказы этого автора уже запечатаны и ждут своего дня.</p>
        ) : (
          stories.map((c) => <StoryCardLink key={c.slug} card={c} />)
        )}
      </section>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
