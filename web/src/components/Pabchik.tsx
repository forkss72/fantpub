import Image from "next/image";
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
    <Image
      src={`/pabchik/${pose}.webp`}
      alt=""
      width={size}
      height={size}
      className={`${styles.figure} ${className ?? ""}`}
      loading={priority ? "eager" : "lazy"}
      unoptimized
    />
  );
}

/** Round avatar used next to Pabchik's lines. */
export function PabchikAvatar({ size = 40, pose = "reading" }: { size?: number; pose?: PabchikPose }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size }} aria-hidden="true">
      <Image src={`/pabchik/${pose}.webp`} alt="" width={size * 1.6} height={size * 1.6} unoptimized />
    </span>
  );
}

/** A line spoken by Pabchik: avatar + text. */
export function PabchikSays({ children, pose = "reading", label = "Пабчик" }: { children: React.ReactNode; pose?: PabchikPose; label?: string }) {
  return (
    <div className={styles.says}>
      <PabchikAvatar pose={pose} />
      <div className={styles.bubble}>
        <span className={styles.name}>{label}</span>
        <p>{children}</p>
      </div>
    </div>
  );
}
