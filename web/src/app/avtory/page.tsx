import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Masthead } from "@/components/Masthead";
import { SiteFooter } from "@/components/SiteFooter";
import { getAuthors, getPublishedStories } from "@/lib/content";
import { plural } from "@/lib/date";
import styles from "./page.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Авторы",
  description: "Все авторы FantPub от А до Я: классики фантастики, мистики и короткой прозы в новых переводах.",
  alternates: { canonical: "/avtory" },
};

export default function AuthorsPage() {
  const published = getPublishedStories();
  const authors = Object.values(getAuthors())
    .map((a) => ({ ...a, n: published.filter((s) => s.author.slug === a.slug).length }))
    .filter((a) => a.n > 0)
    .sort((a, b) => a.name.split(" ").at(-1)!.localeCompare(b.name.split(" ").at(-1)!, "ru"));
  return (
    <main className={`page ${styles.page}`}>
      <Masthead />
      <h1 className={`display ${styles.title}`}>Авторы</h1>
      <ul className={styles.list}>
        {authors.map((a) => (
          <li key={a.slug}>
            <Link href={`/avtor/${a.slug}` as Route} className={styles.row}>
              <span className={styles.name}>{a.name}</span>
              <span className={`mono ${styles.meta}`}>
                {a.born}–{a.died} · {a.n} {plural(a.n, ["рассказ", "рассказа", "рассказов"])}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <SiteFooter />
    </main>
  );
}
