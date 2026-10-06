import Link from "next/link";
import { VK_URL } from "@/lib/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="О проекте">
        <Link href="/o-proekte">О проекте</Link>
        <Link href="/avtory">Авторы</Link>
        <Link href="/o-proekte#prava">Права и переводы</Link>
        <a href={VK_URL} rel="noopener" target="_blank">
          ВКонтакте
        </a>
      </nav>
      <p className={styles.legal}>
        Тексты оригиналов — общественное достояние. Новые переводы — FantPub, 2026. Пабчик живёт за корешками.
      </p>
    </footer>
  );
}
