"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Ticks to the next issue; refreshes the page when the new day opens. */
export function Countdown({ target }: { target: number }) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= target) router.refresh();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, router]);
  return (
    <time dateTime={new Date(target).toISOString()} suppressHydrationWarning style={{ fontVariantNumeric: "tabular-nums" }}>
      {now === null ? "--:--:--" : fmt(target - now)}
    </time>
  );
}
