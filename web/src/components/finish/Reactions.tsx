"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Heart, Lightbulb, Sparkle, type IconType } from "@/components/ui/icons";
import { getDeviceId, setReaction, useHydrated, useShelf } from "@/lib/shelf";
import { EMPTY_COUNTS, REACTIONS, STATS_THRESHOLD, total, type Counts } from "@/lib/reactions";
import { tick } from "@/lib/haptics";
import type { ReactionKey } from "@/lib/types";
import s from "./Finish.module.css";

/** «Не моё»: Phosphor has no neutral face in our set, so it is drawn on Phosphor's grid (256, stroke 16). */
function Meh({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
      <circle cx="128" cy="128" r="96" />
      <line x1="92" y1="160" x2="164" y2="160" />
      <circle cx="92" cy="108" r="10" fill="currentColor" stroke="none" />
      <circle cx="164" cy="108" r="10" fill="currentColor" stroke="none" />
    </svg>
  );
}

const GLYPH: Record<ReactionKey, IconType | null> = { wow: Sparkle, hooked: Heart, pondering: Lightbulb, notmine: null };

function Glyph({ k, size, fill }: { k: ReactionKey; size: number; fill?: boolean }) {
  const Icon = GLYPH[k];
  return Icon ? <Icon size={size} weight={fill ? "fill" : "regular"} aria-hidden="true" /> : <Meh size={size} />;
}

type Burst = { id: number; k: ReactionKey; x: number; dx: number; rise: number; r: number; sc: number; d: number };

/** Apple Music's reaction capsule: four glyphs on glass, the chosen one floats up in a few small bursts. */
export function Reactions({ slug }: { slug: string }) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const mine = hydrated ? shelf.reactions[slug] : undefined;
  const [counts, setCounts] = useState<Counts | null>(null);
  const [preview, setPreview] = useState<ReactionKey | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    let alive = true;
    fetch(`/api/reactions/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { counts: Counts; enabled: boolean } | null) => {
        if (alive && d?.enabled) setCounts(d.counts);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slug]);

  function float(k: ReactionKey, e: MouseEvent<HTMLButtonElement>) {
    if (k === "notmine" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = wrap.current?.getBoundingClientRect();
    const btn = e.currentTarget.getBoundingClientRect();
    if (!box) return;
    const x = btn.left + btn.width / 2 - box.left;
    const fresh: Burst[] = Array.from({ length: 4 }, (_, i) => ({
      id: ++seq.current,
      k,
      x,
      dx: Math.round((Math.random() - 0.5) * 56),
      rise: 70 + Math.round(Math.random() * 60),
      r: Math.round((Math.random() - 0.5) * 40),
      sc: 0.8 + Math.random() * 0.5,
      d: i * 80,
    }));
    setBursts((b) => [...b, ...fresh]);
    const ids = new Set(fresh.map((b) => b.id));
    window.setTimeout(() => setBursts((b) => b.filter((x) => !ids.has(x.id))), 1600);
  }

  async function vote(k: ReactionKey, e: MouseEvent<HTMLButtonElement>) {
    const prev = mine ?? null;
    if (prev === k) return;
    setReaction(slug, k);
    tick();
    float(k, e);
    setCounts((c) => {
      if (!c) return c;
      const n = { ...c, [k]: c[k] + 1 };
      if (prev) n[prev] = Math.max(0, n[prev] - 1);
      return n;
    });
    try {
      const r = await fetch(`/api/reactions/${slug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reaction: k, prev, device: getDeviceId() }),
      });
      const d = r.ok ? ((await r.json()) as { counts: Counts; enabled: boolean }) : null;
      if (d?.enabled) setCounts(d.counts ?? EMPTY_COUNTS);
    } catch {
      /* the reaction is on the shelf either way */
    }
  }

  const t = counts ? total(counts) : 0;
  const shown = preview ?? mine ?? null;
  const label = shown ? REACTIONS.find((r) => r.key === shown)?.label : "";
  const pct = !preview && mine && counts && t >= STATS_THRESHOLD ? Math.round((counts[mine] / t) * 100) : null;

  return (
    <div className={s.react}>
      <h2 className={s.reactTitle} id={`rx-${slug}`}>
        Как вам финал?
      </h2>
      <div className={s.capsuleWrap} ref={wrap}>
        <div className={`${s.capsule} glass`} role="group" aria-labelledby={`rx-${slug}`}>
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              className={s.rx}
              aria-label={r.label}
              aria-pressed={mine === r.key}
              onClick={(e) => vote(r.key, e)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setPreview(r.key)}
              onPointerLeave={() => setPreview(null)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && setPreview(r.key)}
              onBlur={() => setPreview(null)}
            >
              <Glyph k={r.key} size={26} fill={mine === r.key} />
            </button>
          ))}
        </div>
        {bursts.map((b) => (
          <span
            key={b.id}
            className={s.burst}
            aria-hidden="true"
            style={{ "--x": `${b.x}px`, "--dx": `${b.dx}px`, "--rise": `${b.rise}px`, "--r": `${b.r}deg`, "--sc": b.sc, animationDelay: `${b.d}ms` } as CSSProperties}
          >
            <Glyph k={b.k} size={22} fill />
          </span>
        ))}
      </div>
      <p className={`${s.caption} num`} aria-live="polite">
        {label}
        {pct !== null && ` · как у ${pct}% читателей`}
      </p>
    </div>
  );
}
