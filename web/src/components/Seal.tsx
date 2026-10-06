import type { CSSProperties } from "react";
import styles from "./Seal.module.css";

/** Deterministic pseudo-random (mulberry32) so server and client draw the same wax. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Irregular wax puddle outline around (100,100). */
function waxPath(seed: number): string {
  const r = rng(seed);
  const n = 22;
  const pts: [number, number][] = [];
  const phase = r() * Math.PI;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const rad = 86 + Math.sin(t * 5 + phase) * 3.2 + (r() - 0.5) * 6;
    pts.push([100 + Math.cos(t) * rad, 100 + Math.sin(t) * rad]);
  }
  // Catmull-Rom → cubic Bézier for a smooth blob
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

/** Jagged crack from top to bottom, returns polygons for left/right halves. */
function crack(seed: number): { left: string; right: string } {
  const r = rng(seed * 7 + 3);
  const xs: [number, number][] = [];
  for (let y = 0; y <= 200; y += 20) {
    xs.push([96 + (r() - 0.5) * 26, y]);
  }
  const line = xs.map(([x, y]) => `${x.toFixed(1)},${y}`).join(" ");
  return {
    left: `0,0 ${line} 0,200`,
    right: `200,0 ${line} 200,200`,
  };
}

type Props = {
  issue: number;
  size?: number;
  state?: "pending" | "whole" | "broken" | "gone";
  className?: string;
  style?: CSSProperties;
  label?: string;
};

function SealArt({ issue, uid }: { issue: number; uid: string }) {
  const path = waxPath(issue * 13 + 5);
  const ring = `FANTPUB · ВЫПУСК № ${issue} · РАССКАЗ ДНЯ · `;
  return (
    <>
      <defs>
        <radialGradient id={`wax-${uid}`} cx="38%" cy="32%" r="78%">
          <stop offset="0" stopColor="var(--seal-hi)" />
          <stop offset="0.45" stopColor="var(--seal)" />
          <stop offset="1" stopColor="var(--seal-lo)" />
        </radialGradient>
        <radialGradient id={`pool-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </radialGradient>
        <filter id={`tex-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={issue} result="n" />
          <feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .22 0" result="g" />
          <feComposite in="g" in2="SourceGraphic" operator="in" result="gi" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="gi" />
          </feMerge>
        </filter>
        <path id={`ring-${uid}`} d="M100,100 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" />
      </defs>
      {/* puddle */}
      <path d={path} fill={`url(#wax-${uid})`} filter={`url(#tex-${uid})`} />
      <path d={path} fill={`url(#pool-${uid})`} />
      {/* raised rim */}
      <circle cx="100" cy="100" r="70" fill="none" stroke="var(--seal-lo)" strokeOpacity=".55" strokeWidth="3" />
      <circle cx="101" cy="101.5" r="70" fill="none" stroke="var(--seal-hi)" strokeOpacity=".7" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="47" fill="var(--seal)" fillOpacity=".35" stroke="var(--seal-lo)" strokeOpacity=".5" strokeWidth="1.4" />
      {/* ring text, debossed */}
      <text className={styles.ringText} fill="var(--seal-hi)" fillOpacity=".8" dx="0.6" dy="0.8">
        <textPath href={`#ring-${uid}`} textLength="356" lengthAdjust="spacing">
          {ring}
        </textPath>
      </text>
      <text className={styles.ringText} fill="var(--seal-ink)" fillOpacity=".78">
        <textPath href={`#ring-${uid}`} textLength="356" lengthAdjust="spacing">
          {ring}
        </textPath>
      </text>
      {/* Pabchik's glasses — the mark */}
      <g fill="none" strokeLinecap="round">
        <g stroke="var(--seal-hi)" strokeOpacity=".85" strokeWidth="5.5" transform="translate(1 1.4)">
          <circle cx="82" cy="100" r="14" />
          <circle cx="118" cy="100" r="14" />
          <path d="M96 98c2.6-2.4 5.4-2.4 8 0" />
        </g>
        <g stroke="var(--seal-ink)" strokeOpacity=".82" strokeWidth="5">
          <circle cx="82" cy="100" r="14" />
          <circle cx="118" cy="100" r="14" />
          <path d="M96 98c2.6-2.4 5.4-2.4 8 0" />
        </g>
        <g fill="var(--seal-ink)" fillOpacity=".8" stroke="none">
          <circle cx="84" cy="101" r="3" />
          <circle cx="120" cy="101" r="3" />
        </g>
      </g>
      {/* specular */}
      <ellipse cx="72" cy="58" rx="24" ry="11" fill="#fff" fillOpacity=".22" transform="rotate(-28 72 58)" />
    </>
  );
}

/**
 * Sage wax seal with Pabchik's glasses. `broken` splits it along a crack into two halves
 * (animated by CSS) and throws a few crumbs.
 */
export function Seal({ issue, size = 92, state = "whole", className, style, label }: Props) {
  const uid = `s${issue}`;
  const halves = crack(issue);
  return (
    <div
      className={`${styles.seal} ${className ?? ""}`}
      data-state={state}
      style={{ width: size, height: size, ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 200 200" className={styles.half} data-side="left">
        <clipPath id={`cl-${uid}`}>
          <polygon points={halves.left} />
        </clipPath>
        <g clipPath={`url(#cl-${uid})`}>
          <SealArt issue={issue} uid={`${uid}l`} />
        </g>
      </svg>
      <svg viewBox="0 0 200 200" className={styles.half} data-side="right">
        <clipPath id={`cr-${uid}`}>
          <polygon points={halves.right} />
        </clipPath>
        <g clipPath={`url(#cr-${uid})`}>
          <SealArt issue={issue} uid={`${uid}r`} />
        </g>
      </svg>
      <span className={styles.crumbs} aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} style={{ "--i": i } as CSSProperties} />
        ))}
      </span>
    </div>
  );
}
