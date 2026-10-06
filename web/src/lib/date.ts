/**
 * Issue calendar. Issue №1 came out on LAUNCH_DATE; a new issue opens every day
 * at 00:00 Moscow time (UTC+3, no DST). Everything in the past is open forever,
 * only the future is closed.
 */
export const LAUNCH_DATE = "2026-09-24";
export const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const launchUtcMidnight = Date.UTC(2026, 8, 24); // months are 0-based → September

/** Moscow calendar day index since launch (0 = launch day). */
export function dayIndex(now: number = Date.now()): number {
  return Math.floor((now + MSK_OFFSET_MS - launchUtcMidnight) / DAY_MS);
}

/** Issue number that is "today" in Moscow. */
export function currentIssue(now: number = Date.now()): number {
  return dayIndex(now) + 1;
}

/** ISO date (YYYY-MM-DD) of an issue. */
export function issueDate(issue: number): string {
  return new Date(launchUtcMidnight + (issue - 1) * DAY_MS).toISOString().slice(0, 10);
}

/** Epoch ms when an issue opens (00:00 MSK). */
export function issueOpensAt(issue: number): number {
  return launchUtcMidnight + (issue - 1) * DAY_MS - MSK_OFFSET_MS;
}

const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];

/** «7 октября» */
export function humanDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_GEN[m - 1]}`;
}

/** «07.10» */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}

export function weekday(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** Russian plural: plural(5, ['минута','минуты','минут']) */
export function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}
