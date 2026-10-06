import type { CSSProperties } from "react";
import { clothVars } from "@/lib/cloth";
import { motifSvg } from "@/lib/motifs";
import type { ClothKey } from "@/lib/types";
import styles from "./Cover.module.css";

type Props = {
  title: string;
  issue: number;
  motif: string;
  cloth: ClothKey;
  /** Visual density of the label; covers on shelves can hide it. */
  label?: "full" | "compact" | "none";
  className?: string;
  style?: CSSProperties;
};

/**
 * Front face of a clothbound FantPub book: genre cloth, foil-stamped repeating motif,
 * paper title label. Pure SVG + CSS, scales with its box (aspect 2:3).
 */
export function Cover({ title, issue, motif, cloth, label = "full", className, style }: Props) {
  const id = `${motif}-${cloth}`;
  const vars = clothVars(cloth) as CSSProperties;
  const longestWord = Math.max(...title.split(/[\s-]+/).map((w) => w.length));
  const sizeClass =
    longestWord >= 15 ? styles.titleXs : longestWord >= 12 ? styles.titleSm : longestWord >= 9 || title.length > 22 ? styles.titleMd : "";
  return (
    <div className={`${styles.cover} ${className ?? ""}`} style={{ ...vars, ...style }} data-label={label}>
      <svg className={styles.pattern} viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`foil-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--foil)" }} />
            <stop offset="0.42" style={{ stopColor: "var(--foil-hi)" }} />
            <stop offset="0.58" style={{ stopColor: "var(--foil)" }} />
            <stop offset="1" style={{ stopColor: "var(--foil)" }} />
          </linearGradient>
          <pattern id={`pat-${id}`} width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(-6 -10)">
            <g
              transform="translate(6 6) scale(0.92)"
              fill="none"
              stroke="#fff"
              color="#fff"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: motifSvg(motif) }}
            />
            <g transform="translate(56 56) scale(0.92)" fill="none" stroke="#fff" color="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: motifSvg(motif) }} />
            <circle cx="78" cy="22" r="1.6" fill="#fff" />
            <circle cx="28" cy="74" r="1.6" fill="#fff" />
          </pattern>
          <mask id={`mask-${id}`}>
            <rect width="400" height="600" fill={`url(#pat-${id})`} />
          </mask>
        </defs>
        <rect width="400" height="600" fill={`url(#foil-${id})`} mask={`url(#mask-${id})`} />
      </svg>
      {label !== "none" && (
        <div className={styles.label}>
          <span className={styles.issue}>№&nbsp;{issue}</span>
          <span className={`${styles.title} ${sizeClass}`}>{title}</span>
          <span className={styles.ornament} aria-hidden="true">
            ✦
          </span>
        </div>
      )}
    </div>
  );
}
