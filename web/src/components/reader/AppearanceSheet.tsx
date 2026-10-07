"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Segmented } from "@/components/ui/Segmented";
import { ThemeTiles } from "@/components/ui/ThemeTiles";
import { CaretLeft, Check, SlidersHorizontal } from "@/components/ui/icons";
import { DEFAULT_PREFS, setPrefs, useShelf, type Appearance, type Leading, type ReaderFont } from "@/lib/shelf";
import styles from "./AppearanceSheet.module.css";

const APPEARANCE: { value: Appearance; label: string }[] = [
  { value: "auto", label: "Авто" },
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
];

const FONTS: { value: ReaderFont; label: string; family: string }[] = [
  { value: "auto", label: "Как в теме", family: "var(--font-ui)" },
  { value: "serif", label: "Литерата", family: "var(--font-book)" },
  { value: "classic", label: "Old Standard", family: "var(--font-classic)" },
  { value: "sans", label: "Онест", family: "var(--font-sans)" },
  { value: "system", label: "Системный", family: "var(--font-ui)" },
];

const LEADING: { value: Leading; label: string }[] = [
  { value: "compact", label: "Плотно" },
  { value: "normal", label: "Обычно" },
  { value: "airy", label: "Свободно" },
];

/** Apple Books' «Themes & Settings»: size, appearance, six themes; «Настроить» for the details. */
export function AppearanceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { prefs } = useShelf();
  const [view, setView] = useState<"themes" | "custom">("themes");
  const close = () => {
    onClose();
    // back to the first view once the sheet has slid away
    window.setTimeout(() => setView("themes"), 300);
  };

  return (
    <Sheet open={open} onClose={close} title={view === "themes" ? "Оформление" : "Настроить"} className={styles.sheet}>
      {view === "themes" ? (
        <div className={styles.view}>
          <div className={styles.row}>
            <div className={styles.size} role="group" aria-label="Размер текста">
              <button
                type="button"
                className={styles.step}
                aria-label="Мельче"
                disabled={prefs.size <= 1}
                onClick={() => setPrefs({ size: prefs.size - 1 })}
              >
                <span className={styles.aSmall} aria-hidden="true">
                  A
                </span>
              </button>
              <span className={styles.divider} aria-hidden="true" />
              <button
                type="button"
                className={styles.step}
                aria-label="Крупнее"
                disabled={prefs.size >= 7}
                onClick={() => setPrefs({ size: prefs.size + 1 })}
              >
                <span className={styles.aBig} aria-hidden="true">
                  A
                </span>
              </button>
              <span className="sr-only" role="status">
                Размер {prefs.size} из 7
              </span>
            </div>
            <Segmented label="Оформление" value={prefs.appearance} options={APPEARANCE} onChange={(appearance) => setPrefs({ appearance })} />
          </div>
          <ThemeTiles />
          <button type="button" className={`${styles.capsule} press`} onClick={() => setView("custom")}>
            <SlidersHorizontal size={20} aria-hidden="true" />
            Настроить
          </button>
        </div>
      ) : (
        <div className={styles.view}>
          <button type="button" className={styles.back} onClick={() => setView("themes")}>
            <CaretLeft size={18} weight="bold" aria-hidden="true" />
            Темы
          </button>

          <div className={styles.list} role="radiogroup" aria-label="Шрифт">
            {FONTS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={prefs.font === f.value}
                className={styles.cell}
                onClick={() => setPrefs({ font: f.value })}
              >
                <span style={{ fontFamily: f.family }}>{f.label}</span>
                {prefs.font === f.value && <Check size={18} weight="bold" className={styles.check} aria-hidden="true" />}
              </button>
            ))}
          </div>

          <div className={styles.field}>
            <span className={styles.caption} aria-hidden="true">
              Межстрочный интервал
            </span>
            <Segmented label="Межстрочный интервал" value={prefs.leading} options={LEADING} onChange={(leading) => setPrefs({ leading })} />
          </div>

          <label className={styles.switchRow}>
            <span>Выравнивание по ширине</span>
            <input
              type="checkbox"
              role="switch"
              className={styles.switch}
              checked={prefs.justify}
              onChange={(e) => setPrefs({ justify: e.target.checked })}
            />
          </label>

          <button
            type="button"
            className={styles.reset}
            onClick={() => setPrefs({ font: DEFAULT_PREFS.font, size: DEFAULT_PREFS.size, leading: DEFAULT_PREFS.leading, justify: DEFAULT_PREFS.justify })}
          >
            Сбросить
          </button>
        </div>
      )}
    </Sheet>
  );
}
