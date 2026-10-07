import { useSyncExternalStore } from "react";
import { mskDayKey } from "@/lib/date";
import type { ShelfState } from "@/lib/shelf";
import type { Cover } from "@/lib/types";

/** What Today's client pieces need to know about a published issue. */
export type TodayBook = {
  slug: string;
  issue: number;
  title: string;
  mood: string;
  minutes: number;
  cover: Pick<Cover, "src" | "srcSmall" | "placeholder" | "colors">;
};

/** «ироничное» → «Ироничное» */
export const capital = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function inProgress(s: ShelfState, slug: string): number {
  const p = s.percent[slug] ?? 0;
  return !s.read[slug] && p > 0 && p < 100 ? p : 0;
}

/** The unfinished story the reader was in most recently (last progress save, else first opened). */
export function pickContinue(s: ShelfState, books: TodayBook[], exclude?: string): TodayBook | null {
  const last = (slug: string) => s.touched[slug] ?? s.opened[slug] ?? 0;
  let best: TodayBook | null = null;
  for (const b of books) {
    if (b.slug === exclude || !inProgress(s, b.slug)) continue;
    if (!best || last(b.slug) > last(best.slug)) best = b;
  }
  return best;
}

export const minutesLeft = (minutes: number, percent: number) => Math.max(1, Math.round(minutes * (1 - percent / 100)));

const subscribeDay = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  document.addEventListener("visibilitychange", cb);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", cb);
  };
};

/**
 * Noon (MSK) of the current Moscow day. Hydrates with the server's day so the markup matches,
 * then follows the clock (rolls over at midnight while the page stays open).
 */
export function useDayNow(serverNow: number): number {
  const day = useSyncExternalStore(subscribeDay, () => mskDayKey(), () => mskDayKey(serverNow));
  return Date.parse(`${day}T12:00:00+03:00`);
}
