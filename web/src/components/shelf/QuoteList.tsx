"use client";

import Link from "next/link";
import type { Route } from "next";
import { Book } from "@/components/ui/Book";
import { PillMenu } from "@/components/ui/PillMenu";
import { showHud } from "@/components/ui/Hud";
import { Copy, DotsThree, Export, Trash } from "@/components/ui/icons";
import { removeQuote, type Quote } from "@/lib/shelf";
import { humanDate, mskDayKey } from "@/lib/date";
import { SITE_URL } from "@/lib/site";
import type { StoryCard } from "@/lib/types";
import styles from "./QuoteList.module.css";

/** Quote card image (validated server-side against the story text); file share on phones, a new tab elsewhere. */
async function shareCard(q: Quote, title: string) {
  const url = `/rasskaz/${q.slug}/karta?q=${encodeURIComponent(q.text)}`;
  try {
    if (matchMedia("(pointer: coarse)").matches && navigator.canShare) {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `fantpub-${q.slug}.png`, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `«${title}»`, text: `«${q.text}» — «${title}», FantPub ${SITE_URL}/kniga/${q.slug}` });
        return;
      }
    }
  } catch (e) {
    if ((e as DOMException)?.name === "AbortError") return;
  }
  window.open(url, "_blank", "noopener");
}

async function copyQuote(q: Quote, title: string) {
  try {
    await navigator.clipboard.writeText(`«${q.text}»\n— «${title}», FantPub ${SITE_URL}/kniga/${q.slug}`);
    showHud("Цитата скопирована", "quote");
  } catch {
    showHud("Не получилось скопировать");
  }
}

export function QuoteList({ quotes, cards }: { quotes: Quote[]; cards: Map<string, StoryCard> }) {
  return (
    <ul className={styles.list} aria-label="Цитаты">
      {quotes.map((q, i) => {
        const card = cards.get(q.slug);
        const title = card?.title ?? "FantPub";
        return (
          <li key={q.id} className={styles.item}>
            <blockquote className={styles.text}>«{q.text}»</blockquote>
            <div className={styles.meta}>
              {card ? (
                <Link href={`/kniga/${q.slug}` as Route} className={styles.source}>
                  <Book cover={card.cover} width={30} sizes="60px" />
                  <span className={styles.sourceText}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.date}>{humanDate(mskDayKey(q.at))}</span>
                  </span>
                </Link>
              ) : (
                <span className={styles.date}>{humanDate(mskDayKey(q.at))}</span>
              )}
              <PillMenu
                label="Цитата"
                placement={i > 0 && i >= quotes.length - 2 ? "up-end" : "down-end"}
                items={[
                  { label: "Поделиться карточкой", icon: Export, onSelect: () => void shareCard(q, title) },
                  { label: "Скопировать", icon: Copy, onSelect: () => void copyQuote(q, title) },
                  {
                    label: "Удалить",
                    icon: Trash,
                    destructive: true,
                    onSelect: () => {
                      removeQuote(q.id);
                      showHud("Цитата удалена");
                    },
                  },
                ]}
                trigger={(p) => (
                  <button type="button" className={`${styles.more} press`} aria-label="Действия с цитатой" {...p}>
                    <DotsThree size={22} weight="bold" aria-hidden="true" />
                  </button>
                )}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
