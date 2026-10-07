import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

/** Large serif title (Apple's large-title pattern), optional grey second line, glass actions top-right. */
export function PageHeader({ title, subtitle, actions, id }: { title: string; subtitle?: ReactNode; actions?: ReactNode; id?: string }) {
  return (
    <header className={styles.header}>
      <h1 className={`t-large ${styles.title}`} id={id}>
        {title}
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </h1>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
