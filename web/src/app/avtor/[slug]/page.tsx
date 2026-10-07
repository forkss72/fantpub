import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassButton } from "@/components/ui/GlassButton";
import { CaretLeft } from "@/components/ui/icons";
import { BookTile } from "@/components/archive/Books";
import { toItem } from "@/components/archive/items";
import { getAllStories, getAuthors, getStoriesByAuthor, typograph } from "@/lib/content";
import { currentIssue, plural } from "@/lib/date";
import { SITE_URL } from "@/lib/site";
import books from "@/components/archive/Books.module.css";
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
    openGraph: { title: `${a.name} в FantPub`, description: a.bio, url: `/avtor/${slug}` },
    robots: n >= 2 ? undefined : { index: false, follow: true },
  };
}

export default async function AuthorPage({ params }: PageProps<"/avtor/[slug]">) {
  const { slug } = await params;
  const author = getAuthors()[slug];
  if (!author) notFound();
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const items = getStoriesByAuthor(slug, now).map(toItem).reverse();
  const today = currentIssue(now);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    birthDate: String(author.born),
    deathDate: String(author.died),
    url: `${SITE_URL}/avtor/${slug}`,
  };
  return (
    <main className="page">
      <div className="edge-top" aria-hidden="true" />
      <nav className={styles.nav} aria-label="Навигация">
        <GlassButton href="/avtory" icon={CaretLeft} label="Все авторы" />
      </nav>
      <PageHeader title={author.name} subtitle={<span className="num">{`${author.born}–${author.died}`}</span>} />
      <p className={styles.bio}>{typograph(author.bio)}</p>
      <p className={styles.country}>{author.country}</p>

      <section className={styles.section} aria-labelledby="stories">
        <h2 className="t-title2" id="stories">
          Рассказы
        </h2>
        {items.length > 0 ? (
          <ul className={`${books.grid} ${styles.grid}`}>
            {items.map((i) => (
              <BookTile key={i.slug} item={i} today={i.issue === today} />
            ))}
          </ul>
        ) : (
          <p className={`t-sub ${styles.soon}`}>
            {getAllStories().some((s) => s.author.slug === slug) ? "Первый откроется в ближайшие дни." : "Пока ни одного."}
          </p>
        )}
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
