"use client";

import { useSyncExternalStore } from "react";
import { BookmarkSimple, Check, Link as LinkIcon, Quotes, Target, type IconType } from "./icons";
import styles from "./Hud.module.css";

const ICONS: Record<string, IconType> = { check: Check, link: LinkIcon, bookmark: BookmarkSimple, quote: Quotes, goal: Target };

type Hud = { id: number; text: string; icon?: keyof typeof ICONS | string; sub?: string };
let current: Hud | null = null;
let timer = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Apple's frosted confirmation square: one icon, one word, gone in two seconds. */
export function showHud(text: string, icon: string = "check", sub?: string) {
  current = { id: Date.now(), text, icon, sub };
  emit();
  clearTimeout(timer);
  timer = window.setTimeout(() => {
    current = null;
    emit();
  }, 2000);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Mounted once in the root layout. */
export function HudHost() {
  const hud = useSyncExternalStore(subscribe, () => current, () => null);
  if (!hud) return <div className="sr-only" role="status" aria-live="polite" />;
  const Icon = ICONS[hud.icon ?? "check"] ?? Check;
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div key={hud.id} className={`${styles.hud} glass-strong`}>
        <Icon size={44} weight="light" aria-hidden="true" />
        <p className={styles.text}>{hud.text}</p>
        {hud.sub && <p className={styles.sub}>{hud.sub}</p>}
      </div>
    </div>
  );
}
