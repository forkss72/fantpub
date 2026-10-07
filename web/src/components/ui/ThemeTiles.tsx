"use client";

import { setPrefs, useShelf, type ReaderTheme } from "@/lib/shelf";
import styles from "./ThemeTiles.module.css";

export const READER_THEMES: { id: ReaderTheme; name: string }[] = [
  { id: "original", name: "Оригинал" },
  { id: "quiet", name: "Тихая" },
  { id: "paper", name: "Бумага" },
  { id: "bold", name: "Жирная" },
  { id: "calm", name: "Спокойная" },
  { id: "focus", name: "Фокус" },
];

/** Apple Books' theme grid: each tile is a tiny page in that theme's own paper, ink and face. */
export function ThemeTiles() {
  const { prefs } = useShelf();
  return (
    <div className={styles.grid} role="radiogroup" aria-label="Тема чтения">
      {READER_THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={prefs.readerTheme === t.id}
          className={`${styles.tile} press`}
          data-theme-tile={t.id}
          onClick={() => setPrefs({ readerTheme: t.id, font: "auto" })}
        >
          <span className={styles.aa} aria-hidden="true">
            Аа
          </span>
          <span className={styles.name}>{t.name}</span>
        </button>
      ))}
    </div>
  );
}
