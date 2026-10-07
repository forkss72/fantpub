import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CaretRight } from "@/components/ui/icons";
import { surname } from "@/components/archive/items";
import { getAuthors, getPublishedStories } from "@/lib/content";
import { plural } from "@/lib/date";
import grouped from "@/components/archive/Grouped.module.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Авторы",
  description: "Все авторы FantPub от А до Я: классики фантастики, мистики и короткой прозы в новых переводах.",
  alternates: { canonical: "/avtory" },
  openGraph: { title: "Авторы FantPub", description: "Классики короткой прозы от А до Я: фантастика, мистика, ирония.", url: "/avtory" },
};

export default function AuthorsPage() {
  const published = getPublishedStories();
  const authors = Object.values(getAuthors())
    .map((a) => ({ ...a, n: published.filter((s) => s.author.slug === a.slug).length }))
    .filter((a) => a.n > 0)
    .sort((a, b) => surname(a.name).localeCompare(surname(b.name), "ru"));
  return (
    <main className="page">
      <div className="edge-top" aria-hidden="true" />
      <PageHeader title="Авторы" subtitle={`${authors.length} ${plural(authors.length, ["имя", "имени", "имён"])}`} />
      {/* names and counts only: which unread story is whose stays sealed */}
      <ul className={grouped.list}>
        {authors.map((a) => (
          <li key={a.slug}>
            <Link href={`/avtor/${a.slug}` as Route} className={grouped.row}>
              <span className={grouped.text}>
                <span className={grouped.label}>{a.name}</span>
                <span className={`${grouped.sub} num`}>
                  {a.country}, {a.born}–{a.died}
                </span>
              </span>
              <span className={`${grouped.value} num`}>
                {a.n} {plural(a.n, ["рассказ", "рассказа", "рассказов"])}
              </span>
              <CaretRight size={15} weight="bold" className={grouped.chev} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
