"use client";

import type { CSSProperties } from "react";

import styles from "./Segmented.module.css";

/** Flat segmented control (fills, not glass: it usually sits inside a sheet or on the canvas). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  size = "m",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
  size?: "s" | "m";
}) {
  const i = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className={styles.seg} role="radiogroup" aria-label={label} data-size={size} style={{ "--n": options.length, "--i": i } as CSSProperties}>
      <span className={styles.thumb} aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={styles.opt}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
