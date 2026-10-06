import Link from "next/link";
import styles from "./Masthead.module.css";

/** Wordmark + descriptor (168-ФЗ: Russian descriptor next to the Latin name). */
export function Masthead({ right }: { right?: React.ReactNode }) {
  return (
    <header className={styles.masthead}>
      <Link href="/" className={styles.mark} aria-label="FantPub — на главную">
        <span className={styles.glasses} aria-hidden="true">
          <svg viewBox="0 0 40 20">
            <circle cx="10" cy="10" r="7.2" />
            <circle cx="30" cy="10" r="7.2" />
            <path d="M17.4 9c1.6-1.4 3.6-1.4 5.2 0" />
          </svg>
        </span>
        <span className={styles.word}>FantPub</span>
        <span className={styles.descriptor}>рассказ на каждый день</span>
      </Link>
      {right && <div className={styles.right}>{right}</div>}
    </header>
  );
}
