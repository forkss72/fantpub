import Link from "next/link";
import styles from "./status.module.css";

export default function NotFound() {
  return (
    <main className={`page ${styles.page}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small pre-sized webp */}
      <img className={styles.figure} src="/pabchik/sad.webp" alt="" width={152} height={152} decoding="async" />
      <h1 className={`t-large ${styles.title}`}>Такой книги нет</h1>
      <p className={`t-sub ${styles.line}`}>Возможно, выпуск ещё не вышел или ссылка устарела.</p>
      <div className={styles.actions}>
        <Link href="/" className={`${styles.primary} press`}>
          Рассказ дня
        </Link>
        <Link href="/arhiv" className={`${styles.secondary} press`}>
          Архив
        </Link>
      </div>
    </main>
  );
}
