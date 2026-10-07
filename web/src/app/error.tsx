"use client";

import Link from "next/link";
import styles from "./status.module.css";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className={`page ${styles.page}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small pre-sized webp */}
      <img className={styles.figure} src="/pabchik/sad.webp" alt="" width={152} height={152} decoding="async" />
      <h1 className={`t-large ${styles.title}`}>Что-то пошло не так</h1>
      <p className={`t-sub ${styles.line}`}>Попробуйте ещё раз. Полка и прогресс на месте.</p>
      <div className={styles.actions}>
        <button type="button" className={`${styles.primary} press`} onClick={() => retry()}>
          Повторить
        </button>
        <Link href="/" className={`${styles.secondary} press`}>
          На главную
        </Link>
      </div>
    </main>
  );
}
