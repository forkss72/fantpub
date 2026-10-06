import Link from "next/link";
import type { Route } from "next";
import { Cover } from "./Cover";
import { humanDate } from "@/lib/date";
import type { StoryCard } from "@/lib/types";
import styles from "./StoryCardLink.module.css";

/** Horizontal card: small cover + issue, title, author, minutes. */
export function StoryCardLink({ card, hideAuthor }: { card: StoryCard; hideAuthor?: boolean }) {
  return (
    <Link href={`/rasskaz/${card.slug}` as Route} className={styles.card}>
      <span className={styles.cover}>
        <Cover title={card.title} issue={card.issue} motif={card.motif} cloth={card.cloth} label="none" />
      </span>
      <span className={styles.body}>
        <span className={`mono ${styles.meta}`}>
          № {card.issue} · {humanDate(card.date)}
        </span>
        <span className={styles.title}>{card.title}</span>
        <span className={styles.sub}>
          {hideAuthor ? "автор под печатью" : card.authorName} · {card.minutes} мин
        </span>
      </span>
    </Link>
  );
}
