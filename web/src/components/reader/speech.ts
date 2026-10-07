import { useSyncExternalStore } from "react";

/**
 * Read aloud with the Web Speech API: one paragraph at a time, split into sentences
 * (Chrome drops long utterances), the spoken paragraph washed with ink (data-speaking).
 * Pause = cancel + remember the place: speechSynthesis.pause() is unreliable on Android.
 * One reader page at a time, so module state is enough.
 */
export type SpeechStatus = "idle" | "playing" | "paused";

let status: SpeechStatus = "idle";
let pos = { p: 0, c: 0 };
let gen = 0;
let onBlocked: (() => void) | undefined;
const listeners = new Set<() => void>();

function set(s: SpeechStatus) {
  status = s;
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSpeech(): SpeechStatus {
  return useSyncExternalStore(subscribe, () => status, () => "idle");
}
export const getSpeechStatus = () => status;
export const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

const paragraphs = () => [...document.querySelectorAll<HTMLElement>("[data-story-text] p[data-i]")];

/** Sentences, merged up to ~220 characters. */
function chunks(text: string): string[] {
  const parts = text.replace(/\s+/g, " ").trim().match(/[^.!?…]+(?:[.!?…]+[»")]*\s*|$)/g) ?? [text];
  const out: string[] = [];
  for (const s of parts) {
    const last = out.at(-1);
    if (last && last.length + s.length < 220) out[out.length - 1] = last + s;
    else out.push(s);
  }
  return out.map((s) => s.trim()).filter(Boolean);
}

function ruVoice(): SpeechSynthesisVoice | null {
  const ru = speechSynthesis.getVoices().filter((v) => /^ru\b/i.test(v.lang.replace("_", "-")));
  return ru.find((v) => v.localService && /milena|yuri|katya|irina|dariya|pavel/i.test(v.name)) ?? ru.find((v) => v.localService) ?? ru[0] ?? null;
}

function mark(el: HTMLElement | null) {
  document.querySelectorAll("[data-speaking]").forEach((x) => x.removeAttribute("data-speaking"));
  if (!el) return;
  el.dataset.speaking = "";
  const r = el.getBoundingClientRect();
  if (r.top < innerHeight * 0.12 || r.top > innerHeight * 0.7) {
    el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
}

function play(p: number, c: number) {
  const el = paragraphs()[p];
  if (!el) return stopSpeech();
  const parts = chunks(el.textContent ?? "");
  if (c >= parts.length) return play(p + 1, 0);
  pos = { p, c };
  if (c === 0 || !el.hasAttribute("data-speaking")) mark(el);
  const u = new SpeechSynthesisUtterance(parts[c]);
  u.lang = "ru-RU";
  const v = ruVoice();
  if (v) u.voice = v;
  const g = gen;
  u.onend = () => {
    if (g === gen) play(p, c + 1);
  };
  u.onerror = (e) => {
    if (g !== gen || e.error === "interrupted" || e.error === "canceled") return;
    if (e.error === "not-allowed") {
      stopSpeech();
      onBlocked?.();
    } else play(p, c + 1);
  };
  speechSynthesis.speak(u);
}

/** The first paragraph whose bottom is below the top fifth of the screen (the last one past the end). */
export function currentParagraph(): number {
  const els = paragraphs();
  const i = els.findIndex((el) => el.getBoundingClientRect().bottom > innerHeight * 0.2);
  return i === -1 ? Math.max(0, els.length - 1) : i;
}

/** Returns false when there is no Russian voice on this device. */
export function startSpeech(from: number, blocked?: () => void): boolean {
  if (!speechSupported()) return false;
  if (speechSynthesis.getVoices().length > 0 && !ruVoice()) return false;
  onBlocked = blocked;
  gen++;
  speechSynthesis.cancel();
  set("playing");
  play(from, 0);
  return true;
}

export function pauseSpeech() {
  if (status !== "playing") return;
  gen++;
  speechSynthesis.cancel();
  set("paused");
}

export function resumeSpeech() {
  if (status !== "paused") return;
  gen++;
  set("playing");
  play(pos.p, pos.c);
}

export function stopSpeech() {
  gen++;
  if (speechSupported()) speechSynthesis.cancel();
  mark(null);
  if (status !== "idle") set("idle");
}
