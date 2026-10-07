import { addDays, MSK_OFFSET_MS, mskDayKey, weekdayIndex } from "./date";
import type { Goal, ShelfState } from "./shelf";

type StatsInput = Pick<ShelfState, "read" | "opened" | "log" | "guesses" | "quotes" | "reactions" | "goal">;

export const WEEK_LETTERS = ["П", "В", "С", "Ч", "П", "С", "В"];

export function todaySeconds(s: Pick<ShelfState, "log">, now = Date.now()): number {
  return s.log[mskDayKey(now)] ?? 0;
}

/** Days on which a story was finished. */
function readDays(read: Record<string, number>): Set<string> {
  return new Set(Object.values(read).map((t) => mskDayKey(t)));
}

/** A day counts when the daily goal was met or a story was finished that day. */
export function dayProgress(day: string, s: Pick<StatsInput, "log" | "goal">, finished: Set<string>): number {
  if (finished.has(day)) return 1;
  return Math.min(1, (s.log[day] ?? 0) / Math.max(60, s.goal.daily * 60));
}

export type Streak = { current: number; record: number };

export function streak(s: Pick<StatsInput, "log" | "goal" | "read">, now = Date.now()): Streak {
  const finished = readDays(s.read);
  const met = (d: string) => dayProgress(d, s, finished) >= 1;
  const today = mskDayKey(now);
  // today still counts as "in progress": the streak survives until tonight
  let day = met(today) ? today : addDays(today, -1);
  let current = 0;
  while (met(day)) {
    current++;
    day = addDays(day, -1);
  }
  const days = [...new Set([...Object.keys(s.log), ...finished])].filter(met).sort();
  let record = 0;
  let run = 0;
  let prev = "";
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    record = Math.max(record, run);
    prev = d;
  }
  return { current, record: Math.max(record, current) };
}

export type WeekDay = { day: string; letter: string; progress: number; today: boolean; future: boolean };

/** Monday…Sunday of the current Moscow week. */
export function week(s: Pick<StatsInput, "log" | "goal" | "read">, now = Date.now()): WeekDay[] {
  const today = mskDayKey(now);
  const monday = addDays(today, -weekdayIndex(today));
  const finished = readDays(s.read);
  return WEEK_LETTERS.map((letter, i) => {
    const day = addDays(monday, i);
    return { day, letter, progress: day > today ? 0 : dayProgress(day, s, finished), today: day === today, future: day > today };
  });
}

export function readThisYear(read: Record<string, number>, now = Date.now()): number {
  const year = mskDayKey(now).slice(0, 4);
  return Object.values(read).filter((t) => mskDayKey(t).startsWith(year)).length;
}

export function totalMinutes(log: Record<string, number>): number {
  return Math.round(Object.values(log).reduce((a, b) => a + b, 0) / 60);
}

export function guessScore(guesses: Record<string, boolean>): { right: number; total: number } {
  const all = Object.values(guesses);
  return { right: all.filter(Boolean).length, total: all.length };
}

export type Achievement = { id: string; title: string; hint: string; unlocked: boolean };

export function achievements(s: StatsInput, now = Date.now()): Achievement[] {
  const read = Object.keys(s.read).length;
  const { right } = guessScore(s.guesses);
  const { record } = streak(s, now);
  const midnight = Object.values(s.opened).some((t) => new Date(t + MSK_OFFSET_MS).getUTCHours() === 0);
  return [
    { id: "first", title: "Первая книга", hint: "Дочитать первый рассказ", unlocked: read >= 1 },
    { id: "week", title: "Семь дней", hint: "Читать неделю подряд", unlocked: record >= 7 },
    { id: "sleuth", title: "Сыщик", hint: "Угадать пятерых авторов", unlocked: right >= 5 },
    { id: "owl", title: "Полуночник", hint: "Открыть выпуск в первый час после полуночи", unlocked: midnight },
    { id: "ten", title: "Десятка", hint: "Дочитать десять рассказов", unlocked: read >= 10 },
    { id: "quotes", title: "Цитатник", hint: "Сохранить пять цитат", unlocked: s.quotes.length >= 5 },
    { id: "critic", title: "Критик", hint: "Оценить десять финалов", unlocked: Object.keys(s.reactions).length >= 10 },
    { id: "month", title: "Месяц чтения", hint: "Читать тридцать дней подряд", unlocked: record >= 30 },
  ];
}

export function goalLabel(g: Goal): string {
  return `${g.daily} мин в день`;
}
