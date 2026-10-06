import type { ReactionKey } from "./types";

export const REACTIONS: { key: ReactionKey; label: string; stat: string; glyph: string }[] = [
  { key: "wow", label: "Вот это финал", stat: "не ожидали такого финала", glyph: "!" },
  { key: "hooked", label: "Зацепило", stat: "зацепило", glyph: "♥" },
  { key: "pondering", label: "Есть о чём подумать", stat: "задумались", glyph: "?" },
  { key: "notmine", label: "Не моё", stat: "не их рассказ", glyph: "–" },
];

export const REACTION_KEYS = REACTIONS.map((r) => r.key);

/** Show percentages only once a story has this many votes — honest numbers, no fake social proof. */
export const STATS_THRESHOLD = 30;

export type Counts = Record<ReactionKey, number>;

export const EMPTY_COUNTS: Counts = { wow: 0, hooked: 0, pondering: 0, notmine: 0 };

export function total(c: Counts): number {
  return c.wow + c.hooked + c.pondering + c.notmine;
}
