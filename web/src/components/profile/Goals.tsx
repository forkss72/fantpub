"use client";

import { Book } from "@/components/ui/Book";
import { GoalGauge, WeekDots } from "@/components/ui/Goal";
import { Segmented } from "@/components/ui/Segmented";
import { setGoal, type ShelfState } from "@/lib/shelf";
import { readThisYear, streak, todaySeconds, week } from "@/lib/stats";
import { mskDayKey, plural } from "@/lib/date";
import type { StoryCard } from "@/lib/types";
import { Group } from "./Group";
import styles from "./Profile.module.css";
import g from "./Goals.module.css";

const DAILY = ["5", "10", "15", "20", "30"] as const;
const YEARLY = [12, 24, 52, 100, 150, 200, 365];

const days = (n: number) => `${n} ${plural(n, ["день", "дня", "дней"])}`;

function streakLine(s: ShelfState): string {
  const { current, record } = streak(s);
  if (current) return `Серия ${days(current)}${record > current ? ` · рекорд ${record}` : ""}`;
  if (record) return `Рекорд серии: ${days(record)}`;
  return "Серии пока нет";
}

/** Apple Reading Goals: today's gauge, the week, the streak and the year's slots. */
export function Goals({ shelf, cards }: { shelf: ShelfState; cards: Map<string, StoryCard> }) {
  const { goal } = shelf;
  const year = mskDayKey().slice(0, 4);
  const done = Object.entries(shelf.read)
    .filter(([, t]) => mskDayKey(t).startsWith(year))
    .sort((a, b) => a[1] - b[1])
    .map(([slug]) => cards.get(slug));
  const count = readThisYear(shelf.read);
  const yi = YEARLY.reduce((best, v, i) => (Math.abs(v - goal.yearly) < Math.abs(YEARLY[best] - goal.yearly) ? i : best), 0);
  const daily = DAILY.includes(String(goal.daily) as (typeof DAILY)[number]) ? (String(goal.daily) as (typeof DAILY)[number]) : "10";

  return (
    <Group id="goals" title="Цели">
      <div className={`${styles.cell} ${g.today}`}>
        <GoalGauge seconds={todaySeconds(shelf)} goalMinutes={goal.daily} />
        <WeekDots days={week(shelf)} />
        <p className={g.streak}>{streakLine(shelf)}</p>
      </div>
      <div className={styles.stackRow}>
        <span>Минут в день</span>
        <Segmented label="Минут в день" value={daily} options={DAILY.map((v) => ({ value: v, label: v }))} onChange={(v) => setGoal({ daily: Number(v) })} />
      </div>
      <div className={styles.stackRow}>
        <div className={g.yearHead}>
          <span>Прочитано в этом году</span>
          <span className={`${styles.value} num`}>
            {count} из {goal.yearly}
          </span>
        </div>
        <ol className={g.slots} aria-label={`Прочитано ${count} из ${goal.yearly}`}>
          {Array.from({ length: Math.max(goal.yearly, count) }, (_, i) => {
            const card = done[i];
            return i < count ? (
              <li key={i} className={g.slot} data-filled="">
                {card ? <Book cover={card.cover} width={40} sizes="80px" /> : <span className={g.blank} />}
                <span className="sr-only">{card ? `«${card.title}»` : `рассказ ${i + 1}`}</span>
              </li>
            ) : (
              <li key={i} className={g.slot} aria-hidden="true">
                <span className={`${g.blank} num`}>{i + 1}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Рассказов в год</span>
        <div className={g.stepper} role="group" aria-label="Рассказов в год">
          <button type="button" aria-label="Меньше" disabled={yi === 0} onClick={() => setGoal({ yearly: YEARLY[yi - 1] })}>
            −
          </button>
          <output className="num" aria-live="polite">
            {goal.yearly}
          </output>
          <button type="button" aria-label="Больше" disabled={yi === YEARLY.length - 1} onClick={() => setGoal({ yearly: YEARLY[yi + 1] })}>
            +
          </button>
        </div>
      </div>
    </Group>
  );
}
