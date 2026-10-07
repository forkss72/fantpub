"use client";

import { useSyncExternalStore } from "react";
import { mskDayKey } from "./date";
import type { ReactionKey } from "./types";

/** Everything lives in this browser. No account, no guilt. */
export type Appearance = "auto" | "light" | "dark";
/** Reader themes, after Apple Books: each one is a paper colour plus a typeface. */
export type ReaderTheme = "original" | "quiet" | "paper" | "bold" | "calm" | "focus";
/** "auto" = the theme's own face. */
export type ReaderFont = "auto" | "serif" | "classic" | "sans" | "system";
export type Leading = "compact" | "normal" | "airy";

export type Prefs = {
  appearance: Appearance;
  readerTheme: ReaderTheme;
  font: ReaderFont;
  /** 1…7, 4 is the default */
  size: number;
  leading: Leading;
  justify: boolean;
  /** Hide author and year of unread stories until the end. */
  blind: boolean;
  /** iOS Safari can't report Reduce Transparency: our own switch. */
  glass: "regular" | "solid";
  /** Opt-in gyroscope tilt of today's book (iOS asks for permission). */
  tilt: boolean;
};

export type Quote = { id: string; slug: string; text: string; at: number };

export type Goal = {
  /** minutes a day */
  daily: number;
  /** stories a year */
  yearly: number;
};

export type Profile = {
  name: string;
  /** Pabchik pose id ("reading", "wave", …) or "" for initials */
  avatar: string;
};

export type ShelfState = {
  v: 2;
  /** slug → finished at (epoch ms) */
  read: Record<string, number>;
  /** slug → first opened at */
  opened: Record<string, number>;
  /** slug → last paragraph index seen */
  progress: Record<string, number>;
  /** slug → 0…100 */
  percent: Record<string, number>;
  reactions: Record<string, ReactionKey>;
  /** slug → guessed the author right */
  guesses: Record<string, boolean>;
  /** slug → added to «Хочу прочитать» at */
  want: Record<string, number>;
  quotes: Quote[];
  /** Moscow day "YYYY-MM-DD" → seconds of active reading */
  log: Record<string, number>;
  goal: Goal;
  profile: Profile;
  prefs: Prefs;
  onboarded: boolean;
  installHintDismissed: boolean;
};

const KEY = "fantpub:v2";
const LEGACY_KEY = "fantpub:v1";

export const DEFAULT_PREFS: Prefs = {
  appearance: "auto",
  readerTheme: "original",
  font: "auto",
  size: 4,
  leading: "normal",
  justify: false,
  blind: true,
  glass: "regular",
  tilt: false,
};

export const DEFAULT_GOAL: Goal = { daily: 10, yearly: 100 };

const EMPTY: ShelfState = {
  v: 2,
  read: {},
  opened: {},
  progress: {},
  percent: {},
  reactions: {},
  guesses: {},
  want: {},
  quotes: [],
  log: {},
  goal: DEFAULT_GOAL,
  profile: { name: "", avatar: "reading" },
  prefs: DEFAULT_PREFS,
  onboarded: false,
  installHintDismissed: false,
};

let state: ShelfState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const THEMES: ReaderTheme[] = ["original", "quiet", "paper", "bold", "calm", "focus"];

function sanitize(raw: Partial<ShelfState>): ShelfState {
  const prefs = { ...DEFAULT_PREFS, ...(raw.prefs ?? {}) };
  if (!THEMES.includes(prefs.readerTheme)) prefs.readerTheme = "original";
  prefs.size = Math.min(7, Math.max(1, Math.round(Number(prefs.size) || 4)));
  return {
    ...EMPTY,
    ...raw,
    v: 2,
    prefs,
    goal: { ...DEFAULT_GOAL, ...(raw.goal ?? {}) },
    profile: { ...EMPTY.profile, ...(raw.profile ?? {}) },
    quotes: Array.isArray(raw.quotes) ? raw.quotes : [],
  };
}

/** v1 (night shift build) → v2: keep the reading history, map old prefs. */
function migrate(v1: Record<string, unknown>): ShelfState {
  const p = (v1.prefs ?? {}) as Record<string, unknown>;
  const theme = p.theme as string | undefined;
  const font = p.font as string | undefined;
  return sanitize({
    read: (v1.read as ShelfState["read"]) ?? {},
    opened: (v1.opened as ShelfState["opened"]) ?? {},
    progress: (v1.progress as ShelfState["progress"]) ?? {},
    reactions: (v1.reactions as ShelfState["reactions"]) ?? {},
    guesses: (v1.guesses as ShelfState["guesses"]) ?? {},
    prefs: {
      ...DEFAULT_PREFS,
      appearance: theme === "paper" ? "light" : theme === "dusk" || theme === "night" ? "dark" : "auto",
      readerTheme: font === "classic" ? "calm" : font === "onest" ? "focus" : "original",
      blind: p.blind !== false,
    },
    installHintDismissed: Boolean(v1.installHintDismissed),
  });
}

function load(): ShelfState {
  if (loaded) return state;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = sanitize(JSON.parse(raw) as Partial<ShelfState>);
    else {
      const legacy = localStorage.getItem(LEGACY_KEY);
      state = legacy ? migrate(JSON.parse(legacy)) : EMPTY;
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
  const next = fn(load());
  if (next === state) return;
  state = next;
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
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
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
      : {
          ...s,
          read: { ...s.read, [slug]: Date.now() },
          opened: { ...s.opened, [slug]: s.opened[slug] ?? Date.now() },
          percent: { ...s.percent, [slug]: 100 },
        },
  );
}

export function saveProgress(slug: string, paragraph: number, percent: number) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  updateShelf((s) =>
    s.progress[slug] === paragraph && s.percent[slug] === pct
      ? s
      : { ...s, progress: { ...s.progress, [slug]: paragraph }, percent: { ...s.percent, [slug]: Math.max(pct, s.read[slug] ? 100 : 0) } },
  );
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
  updateShelf((s) => (slug in s.guesses ? s : { ...s, guesses: { ...s.guesses, [slug]: right } }));
}

export function toggleWant(slug: string, on?: boolean) {
  updateShelf((s) => {
    const want = { ...s.want };
    const next = on ?? !want[slug];
    if (next) want[slug] = Date.now();
    else delete want[slug];
    return { ...s, want };
  });
}

export function addQuote(slug: string, text: string): Quote {
  const q: Quote = { id: Math.random().toString(36).slice(2, 10), slug, text: text.trim(), at: Date.now() };
  updateShelf((s) => (s.quotes.some((x) => x.slug === slug && x.text === q.text) ? s : { ...s, quotes: [q, ...s.quotes] }));
  return q;
}

export function removeQuote(id: string) {
  updateShelf((s) => ({ ...s, quotes: s.quotes.filter((q) => q.id !== id) }));
}

/** Adds seconds of active reading to today's Moscow day. */
export function logReading(seconds: number, now = Date.now()) {
  if (seconds <= 0) return;
  const day = mskDayKey(now);
  updateShelf((s) => ({ ...s, log: { ...s.log, [day]: Math.round((s.log[day] ?? 0) + seconds) } }));
}

export function setGoal(patch: Partial<Goal>) {
  updateShelf((s) => ({ ...s, goal: { ...s.goal, ...patch } }));
}

export function setProfile(patch: Partial<Profile>) {
  updateShelf((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
}

export function setPrefs(patch: Partial<Prefs>) {
  updateShelf((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
  applyPrefs(getShelf().prefs);
}

export function completeOnboarding() {
  updateShelf((s) => (s.onboarded ? s : { ...s, onboarded: true }));
}

export function dismissInstallHint() {
  updateShelf((s) => ({ ...s, installHintDismissed: true }));
}

/** Clears reading history; keeps prefs, goal and profile. */
export function resetShelf() {
  state = { ...EMPTY, prefs: state.prefs, goal: state.goal, profile: state.profile, onboarded: true };
  persist();
  emit();
}

/* ─── prefs → <html> (the inline head script does the same before first paint) ─── */

export function resolvedAppearance(p: Prefs): "light" | "dark" {
  if (p.appearance !== "auto") return p.appearance;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyPrefs(p: Prefs) {
  const html = document.documentElement;
  const scheme = resolvedAppearance(p);
  html.dataset.scheme = scheme;
  html.dataset.reader = p.readerTheme;
  html.dataset.font = p.font;
  html.dataset.size = String(p.size);
  html.dataset.leading = p.leading;
  html.dataset.justify = p.justify ? "1" : "0";
  html.dataset.glass = p.glass;
  const meta = document.querySelector('meta[name="theme-color"]');
  // in the reader the browser bar takes the paper colour of the chosen theme
  const paper = location.pathname.startsWith("/rasskaz/") ? getComputedStyle(html).getPropertyValue("--paper").trim() : "";
  if (meta) meta.setAttribute("content", paper || (scheme === "dark" ? "#000000" : "#ffffff"));
}

/* ─── shelf key: move your shelf to another device without an account ─── */

type KeyPayload = {
  r: [string, number][];
  x: [string, ReactionKey][];
  p: Partial<Prefs>;
  g?: [string, boolean][];
  w?: string[];
  q?: [string, string][];
  gl?: Goal;
  n?: string;
};

export function exportKey(s: ShelfState = getShelf()): string {
  const payload: KeyPayload = {
    r: Object.entries(s.read).map(([k, t]) => [k, Math.round(t / 1000)]),
    x: Object.entries(s.reactions),
    p: s.prefs,
    g: Object.entries(s.guesses),
    w: Object.keys(s.want),
    q: s.quotes.slice(0, 40).map((q) => [q.slug, q.text]),
    gl: s.goal,
    n: s.profile.name,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function importKey(key: string): boolean {
  try {
    const b64 = key.trim().replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as KeyPayload;
    if (!Array.isArray(payload.r) || !Array.isArray(payload.x)) return false;
    updateShelf((s) => {
      const read = { ...s.read };
      for (const [slug, t] of payload.r) read[slug] = Math.max(read[slug] ?? 0, t * 1000);
      const opened = { ...s.opened };
      const percent = { ...s.percent };
      for (const slug of Object.keys(read)) {
        opened[slug] = opened[slug] ?? read[slug];
        percent[slug] = 100;
      }
      const want = { ...s.want };
      for (const slug of payload.w ?? []) want[slug] = want[slug] ?? Date.now();
      const quotes = [...s.quotes];
      for (const [slug, text] of payload.q ?? []) {
        if (!quotes.some((q) => q.slug === slug && q.text === text)) quotes.push({ id: Math.random().toString(36).slice(2, 10), slug, text, at: Date.now() });
      }
      return sanitize({
        ...s,
        read,
        opened,
        percent,
        want,
        quotes,
        reactions: { ...s.reactions, ...Object.fromEntries(payload.x) },
        guesses: { ...s.guesses, ...Object.fromEntries(payload.g ?? []) },
        prefs: { ...s.prefs, ...payload.p },
        goal: payload.gl ?? s.goal,
        profile: { ...s.profile, name: payload.n || s.profile.name },
        onboarded: true,
      });
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
