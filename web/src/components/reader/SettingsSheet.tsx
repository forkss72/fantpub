"use client";

import { useEffect, useRef } from "react";
import { setPrefs, useShelf, type Prefs, type ReadingFont, type Theme } from "@/lib/shelf";
import styles from "./SettingsSheet.module.css";

const THEMES: { key: Theme; label: string }[] = [
  { key: "auto", label: "Авто" },
  { key: "paper", label: "Бумага" },
  { key: "dusk", label: "Сумерки" },
  { key: "night", label: "Ночь" },
];

const FONTS: { key: ReadingFont; label: string; note: string; family: string }[] = [
  { key: "literata", label: "Литерата", note: "книжная, как в Google Play Книгах", family: "var(--font-literata)" },
  { key: "ptserif", label: "PT Serif", note: "классическая русская антиква", family: "var(--font-ptserif)" },
  { key: "onest", label: "Онест", note: "без засечек, для экрана", family: "var(--font-onest)" },
];

/** Bottom sheet with reading settings. Native <dialog>, light-dismiss. */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { prefs } = useShelf();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClick = (e: MouseEvent) => {
      if ("closedBy" in HTMLDialogElement.prototype || e.target !== d) return;
      const r = d.getBoundingClientRect();
      const inside = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
      if (!inside) d.close();
    };
    d.addEventListener("click", onClick);
    return () => d.removeEventListener("click", onClick);
  }, []);

  const set = (p: Partial<Prefs>) => setPrefs(p);

  return (
    // eslint-disable-next-line react/no-unknown-property
    <dialog ref={ref} className={styles.sheet} aria-labelledby="settings-title" onClose={onClose} {...{ closedby: "any" }}>
      <div className={styles.grip} aria-hidden="true" />
      <h2 id="settings-title" className={styles.h}>
        Настройки чтения
      </h2>

      <fieldset className={styles.group}>
        <legend>Тема</legend>
        <div className={styles.themes}>
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              className={styles.theme}
              data-theme-swatch={t.key}
              aria-pressed={prefs.theme === t.key}
              onClick={() => set({ theme: t.key })}
            >
              <span className={styles.swatch} aria-hidden="true">
                Aa
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Шрифт</legend>
        <div className={styles.fonts}>
          {FONTS.map((f) => (
            <button key={f.key} type="button" className={styles.font} aria-pressed={prefs.font === f.key} onClick={() => set({ font: f.key })}>
              <span className={styles.fontSample} style={{ fontFamily: f.family }}>
                Аа
              </span>
              <span className={styles.fontName}>{f.label}</span>
              <span className={styles.fontNote}>{f.note}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Размер</legend>
        <div className={styles.size}>
          <button type="button" aria-label="Мельче" disabled={prefs.size <= 1} onClick={() => set({ size: Math.max(1, prefs.size - 1) as Prefs["size"] })}>
            <span style={{ fontSize: 14 }}>А</span>
          </button>
          <div className={styles.dots} role="img" aria-label={`Размер ${prefs.size} из 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} data-on={n <= prefs.size} />
            ))}
          </div>
          <button type="button" aria-label="Крупнее" disabled={prefs.size >= 5} onClick={() => set({ size: Math.min(5, prefs.size + 1) as Prefs["size"] })}>
            <span style={{ fontSize: 22 }}>А</span>
          </button>
        </div>
      </fieldset>

      <div className={styles.toggles}>
        <label className={styles.toggle}>
          <span>
            <strong>Воздух между строк</strong>
            <small>для усталых глаз и длинных абзацев</small>
          </span>
          <input type="checkbox" role="switch" checked={prefs.leading === "airy"} onChange={(e) => set({ leading: e.target.checked ? "airy" : "normal" })} />
        </label>
        <label className={styles.toggle}>
          <span>
            <strong>Слепое чтение</strong>
            <small>автор рассказа дня скрыт до финала</small>
          </span>
          <input type="checkbox" role="switch" checked={prefs.blind} onChange={(e) => set({ blind: e.target.checked })} />
        </label>
      </div>

      <form method="dialog">
        <button className={`pill ${styles.done}`}>Готово</button>
      </form>
    </dialog>
  );
}
