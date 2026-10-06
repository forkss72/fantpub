import type { CSSProperties } from "react";
import { clothVars } from "@/lib/cloth";
import type { ClothKey } from "@/lib/types";
import styles from "./Spine.module.css";

/** A book spine standing on a shelf. Height varies a little by issue for a hand-made shelf. */
export function Spine({
  title,
  issue,
  cloth,
  minutes,
  state = "unread",
  height,
}: {
  title: string;
  issue: number;
  cloth: ClothKey;
  minutes: number;
  state?: "unread" | "read" | "today";
  height?: number;
}) {
  const h = height ?? 150 + ((issue * 37) % 5) * 7;
  const w = 30 + Math.min(16, Math.round(minutes * 1.2));
  return (
    <span className={styles.spine} style={{ ...(clothVars(cloth) as CSSProperties), height: h, width: w }} data-state={state} aria-hidden="true">
      <span className={styles.band} />
      <span className={styles.title}>{title}</span>
      <span className={styles.foot}>
        <span className={styles.mark} aria-hidden="true" />
        <span className={styles.issue}>{issue}</span>
      </span>
    </span>
  );
}
