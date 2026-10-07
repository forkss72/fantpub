"use client";

import type { WeekDay } from "@/lib/stats";
import styles from "./Goal.module.css";

/** Small ring for the 44px header circle: today's minutes against the daily goal. */
export function GoalRing({
  progress,
  size = 26,
}: {
  progress: number;
  size?: number;
}) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={styles.ring}
    >
      <circle cx={size / 2} cy={size / 2} r={r} className={styles.track} />
      {p > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={styles.arc}
          strokeDasharray={`${c * p} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  );
}

/** Apple Reading Goals gauge: a semicircle with the minutes in big serif numerals. */
export function GoalGauge({
  seconds,
  goalMinutes,
}: {
  seconds: number;
  goalMinutes: number;
}) {
  const p = Math.max(0, Math.min(1, seconds / (goalMinutes * 60)));
  const R = 120;
  const len = Math.PI * R;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return (
    <div className={styles.gauge}>
      <svg viewBox="0 0 280 150" aria-hidden="true">
        <path d="M20 140 A120 120 0 0 1 260 140" className={styles.gTrack} />
        {p > 0 && (
          <path
            d="M20 140 A120 120 0 0 1 260 140"
            className={styles.gArc}
            strokeDasharray={`${len * p} ${len}`}
          />
        )}
      </svg>
      <div className={styles.readout}>
        <span className={styles.caption}>Сегодня</span>
        <span className={`${styles.big} num`}>
          {m}:{String(s).padStart(2, "0")}
        </span>
        <span className={styles.caption}>из {goalMinutes} минут</span>
      </div>
    </div>
  );
}

/** П В С Ч П С В: filled when the day counted, a partial ring while in progress. */
export function WeekDots({ days }: { days: WeekDay[] }) {
  return (
    <ol className={styles.week} aria-label="Неделя чтения">
      {days.map((d) => (
        <li
          key={d.day}
          className={styles.day}
          data-today={d.today ? "" : undefined}
          data-future={d.future ? "" : undefined}
        >
          <span className={styles.letter}>{d.letter}</span>
          <span
            className={styles.dot}
            data-done={d.progress >= 1 ? "" : undefined}
          >
            {d.progress > 0 && d.progress < 1 && (
              <GoalRing progress={d.progress} size={24} />
            )}
          </span>
          <span className="sr-only">
            {d.progress >= 1
              ? "цель выполнена"
              : d.future
                ? "впереди"
                : `${Math.round(d.progress * 100)}%`}
          </span>
        </li>
      ))}
    </ol>
  );
}
