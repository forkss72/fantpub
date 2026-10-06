"use client";

import { Pabchik } from "./Pabchik";
import { updateShelf, useHydrated, useShelf } from "@/lib/shelf";
import styles from "./IntroCard.module.css";

/** One dismissible card on the first visit. No multi-screen onboarding. */
export function IntroCard() {
  const shelf = useShelf();
  const hydrated = useHydrated();
  if (!hydrated || shelf.introSeen) return null;
  const close = () => {
    updateShelf((s) => ({ ...s, introSeen: true }));
    window.setTimeout(() => document.getElementById("today-title")?.focus(), 30);
  };
  return (
    <section className={styles.card} aria-labelledby="intro-title">
      <Pabchik pose="explaining" size={92} className={styles.figure} priority />
      <div className={styles.text}>
        <h2 id="intro-title" className={styles.title}>
          Я Пабчик, домовой этого дома историй
        </h2>
        <p>
          Каждый день я запечатываю одну книгу. Сломайте печать, прочитайте — по будням рассказы на 5–10 минут, по выходным длиннее — и угадайте автора: его имя спрятано до финала.
        </p>
        <button type="button" className={`pill pill--sage ${styles.btn}`} onClick={close}>
          Понятно, показывайте
        </button>
      </div>
      <button type="button" className={styles.close} onClick={close} aria-label="Закрыть">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </section>
  );
}
