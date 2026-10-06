/* eslint-disable @next/next/no-img-element -- tiny pre-sized webp, no optimizer round-trip */
import styles from "./Pabchik.module.css";

export type PabchikPose =
  | "reading"
  | "explaining"
  | "sealed-book"
  | "sleeping"
  | "sad"
  | "surprised"
  | "celebrating"
  | "goodbye"
  | "peeking"
  | "searching"
  | "thinking";

/** Full-figure Pabchik. Never bigger than the book of the day. */
export function Pabchik({ pose, size = 120, className, priority }: { pose: PabchikPose; size?: number; className?: string; priority?: boolean }) {
  return (
    <img
      src={`/pabchik/${pose}.webp`}
      alt=""
      width={size}
      height={size}
      className={`${styles.figure} ${className ?? ""}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

/** Round avatar used next to Pabchik's lines: his head and glasses. */
export function PabchikAvatar({ size = 40 }: { size?: number; pose?: PabchikPose }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size }} aria-hidden="true">
      <img src="/pabchik/avatar.webp" alt="" width={size} height={size} decoding="async" />
    </span>
  );
}

/** A line spoken by Pabchik: avatar + text. */
export function PabchikSays({ children, label = "Пабчик" }: { children: React.ReactNode; pose?: PabchikPose; label?: string }) {
  return (
    <div className={styles.says}>
      <PabchikAvatar />
      <div className={styles.bubble}>
        <span className={styles.name}>{label}</span>
        <p>{children}</p>
      </div>
    </div>
  );
}
