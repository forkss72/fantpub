"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * Ticks to the next issue. When it opens: one refresh, then at most three jittered
 * retries (ISR may still serve the old page for a few minutes) — never a refresh loop.
 */
export function Countdown({ target }: { target: number }) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  const attempts = useRef(0);
  const nextTry = useRef(0);

  useEffect(() => {
    attempts.current = 0;
    nextTry.current = 0;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t < target || document.visibilityState !== "visible") return;
      if (attempts.current >= 4 || t - target > 15 * 60 * 1000) return;
      if (t >= nextTry.current) {
        attempts.current += 1;
        nextTry.current =
          t +
          (attempts.current === 1 ? 4000 : 25000 * attempts.current) +
          Math.random() * 15000;
        router.refresh();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, router]);

  // the issue is out but the cached page isn't fresh yet: offer a manual refresh instead of a frozen 00:00:00
  // (callers print «через» before it)
  if (now !== null && now >= target) {
    return (
      <>
        <span>00:00:00 · </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.refresh();
          }}
          style={{
            font: "inherit",
            color: "inherit",
            background: "none",
            border: 0,
            padding: 0,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor: "pointer",
          }}
        >
          обновить
        </button>
      </>
    );
  }

  return (
    <time
      dateTime={new Date(target).toISOString()}
      suppressHydrationWarning
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {now === null ? "--:--:--" : fmt(target - now)}
    </time>
  );
}
