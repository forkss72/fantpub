import { useId, type ReactNode } from "react";
import styles from "./Profile.module.css";

/** Inset grouped section: serif title, one rounded list, optional grey footer. */
export function Group({ title, aside, footer, id, children }: { title?: string; aside?: ReactNode; footer?: ReactNode; id?: string; children: ReactNode }) {
  const h = useId();
  return (
    <section className={styles.section} id={id} aria-labelledby={title ? h : undefined}>
      {title && (
        <div className={styles.head}>
          <h2 className="t-title2" id={h}>
            {title}
          </h2>
          {aside && <span className={styles.aside}>{aside}</span>}
        </div>
      )}
      <div className={styles.group}>{children}</div>
      {footer && <p className={styles.footer}>{footer}</p>}
    </section>
  );
}
