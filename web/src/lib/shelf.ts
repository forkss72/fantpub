"use client";

import { useSyncExternalStore } from "react";
import type { ReactionKey } from "./types";

/** Everything lives in this browser. No account, no guilt. */
export type Theme = "auto" | "paper" | "dusk" | "night";
export type ReadingFont = "literata" | "classic" | "onest";

export type Prefs = {
  theme: Theme;
  font: ReadingFont;
  size: 1 | 2 | 3 | 4 | 5;
  leading: "normal" | "airy";
  /** Hide author & year of today's story until the end. */
  blind: boolean;
};

export type ShelfState = {
  v: 1;
  /** slug → finished at (epoch ms) */
  read: Record<string, number>;
  /** slug → seal broken at */
  opened: Record<string, number>;
  /** slug → last paragraph index seen */
  progress: Record<string, number>;
  reactions: Record<string, ReactionKey>;
  /** slug → guessed the author right */
  guesses: Record<string, boolean>;
  prefs: Prefs;
  introSeen: boolean;
  /** Moscow day index when the full ritual animation last played. */
  ritualDay: number | null;
  installHintDismissed: boolean;
};

const KEY = "fantpub:v1";

export const DEFAULT_PREFS: Prefs = { theme: "auto", font: "literata", size: 3, leading: "normal", blind: true };

const EMPTY: ShelfState = {
  v: 1,
  read: {},
  opened: {},
  progress: {},
  reactions: {},
  guesses: {},
  prefs: DEFAULT_PREFS,
  introSeen: false,
  ritualDay: null,
  installHintDismissed: false,
};

let state: ShelfState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): ShelfState {
  if (loaded) return state;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ShelfState>;
      state = { ...EMPTY, ...parsed, prefs: { ...DEFAULT_PREFS, ...(parsed.prefs ?? {}) } };
      if (!["literata", "classic", "onest"].includes(state.prefs.font)) state.prefs = { ...state.prefs, font: "literata" };
    }
  } catch {
    state = EMPTY;
  }
  return state;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — keep working in memory */
  }
}

function emit() {
  for (const l of listeners) l();
}

export function getShelf(): ShelfState {
  return typeof window === "undefined" ? EMPTY : load();
}

export function updateShelf(fn: (s: ShelfState) => ShelfState) {
  state = fn(load());
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useShelf(): ShelfState {
  return useSyncExternalStore(subscribe, getShelf, () => EMPTY);
}

/** True after hydration — lets components avoid flashing "unread" for read items. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
function noopSubscribe() {
  return () => {};
}

/* ─── actions ─── */

export function markOpened(slug: string) {
  updateShelf((s) => (s.opened[slug] ? s : { ...s, opened: { ...s.opened, [slug]: Date.now() } }));
}

export function markRead(slug: string) {
  updateShelf((s) =>
    s.read[slug]
      ? s
      : { ...s, read: { ...s.read, [slug]: Date.now() }, opened: { ...s.opened, [slug]: s.opened[slug] ?? Date.now() } },
  );
}

export function saveProgress(slug: string, paragraph: number) {
  updateShelf((s) => (s.progress[slug] === paragraph ? s : { ...s, progress: { ...s.progress, [slug]: paragraph } }));
}

export function setReaction(slug: string, r: ReactionKey | null) {
  updateShelf((s) => {
    const reactions = { ...s.reactions };
    if (r) reactions[slug] = r;
    else delete reactions[slug];
    return { ...s, reactions };
  });
}

export function setGuess(slug: string, right: boolean) {
  updateShelf((s) => ({ ...s, guesses: { ...s.guesses, [slug]: right } }));
}

export function setPrefs(patch: Partial<Prefs>) {
  updateShelf((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
  applyPrefs(getShelf().prefs);
}

export function resetShelf() {
  state = { ...EMPTY, prefs: state.prefs, introSeen: true };
  persist();
  emit();
}

/** Mirrors prefs on <html> (the inline head script does the same before first paint). */
export function applyPrefs(p: Prefs) {
  const html = document.documentElement;
  const theme = p.theme === "auto" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dusk" : "paper") : p.theme;
  html.dataset.theme = theme;
  html.dataset.font = p.font;
  html.dataset.size = String(p.size);
  html.dataset.leading = p.leading;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "paper" ? "#f6f2e7" : theme === "dusk" ? "#24201a" : "#121211");
}

/* ─── shelf key: move your shelf to another device without an account ─── */

type KeyPayload = { r: [string, number][]; x: [string, ReactionKey][]; p: Prefs };

export function exportKey(s: ShelfState = getShelf()): string {
  const payload: KeyPayload = {
    r: Object.entries(s.read).map(([k, t]) => [k, Math.round(t / 1000)]),
    x: Object.entries(s.reactions),
    p: s.prefs,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function importKey(key: string): boolean {
  try {
    const b64 = key.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as KeyPayload;
    updateShelf((s) => {
      const read = { ...s.read };
      for (const [slug, t] of payload.r) read[slug] = Math.max(read[slug] ?? 0, t * 1000);
      const reactions = { ...s.reactions, ...Object.fromEntries(payload.x) };
      const opened = { ...s.opened };
      for (const slug of Object.keys(read)) opened[slug] = opened[slug] ?? read[slug];
      return { ...s, read, reactions, opened, prefs: { ...s.prefs, ...payload.p }, introSeen: true };
    });
    applyPrefs(getShelf().prefs);
    return true;
  } catch {
    return false;
  }
}

/** Anonymous per-browser id: one reaction per device per story. Not tied to a person. */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem("fantpub:device");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("fantpub:device", id);
    }
    return id;
  } catch {
    return "anon-device-0000";
  }
}
