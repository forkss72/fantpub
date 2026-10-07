"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Book } from "@/components/ui/Book";
import { SealedAuthor } from "@/components/ui/SealedAuthor";
import { useShelf } from "@/lib/shelf";
import { coverVars } from "@/lib/cover";
import { capital, inProgress, type TodayBook } from "./state";
import styles from "./Hero.module.css";
import { BookTransition } from "@/components/book/BookTransition";

type Props = { story: TodayBook & { authorName: string; year: number } };

/** The book of the day as an object on a band painted with its own cover colour. */
export function Hero({ story }: Props) {
  const shelf = useShelf();
  const band = useRef<HTMLElement>(null);
  useTilt(band, shelf.prefs.tilt);

  const href = `/kniga/${story.slug}` as Route;
  const pct = inProgress(shelf, story.slug);
  const cta = shelf.read[story.slug] ? "Прочитано · Открыть заново" : pct ? `Продолжить · ${pct}%` : "Читать";

  return (
    <section ref={band} className={styles.band} style={coverVars(story.cover.colors)} aria-labelledby="today-title">
      <div className={styles.inner}>
        {/* the button below is the accessible control; the cover is the same target for the finger */}
        <Link href={href} className={styles.object} tabIndex={-1} aria-hidden="true">
          <BookTransition slug={story.slug}>
            <div className={styles.tilt}>
              <Book
                cover={story.cover}
                title={story.title}
                issue={story.issue}
                width="var(--hero-w)"
                sizes="(min-width: 900px) 300px, min(58vw, 260px)"
                depth
                sheen
                priority
              />
            </div>
          </BookTransition>
          <span className={styles.floor} />
        </Link>

        <div className={styles.text}>
          <h2 id="today-title" className={styles.title}>
            {story.title}
          </h2>
          <p className={styles.meta}>
            {capital(story.mood)} · {story.minutes} мин · № {story.issue}
          </p>
          <p className={styles.author} data-seal={story.slug}>
            <SealedAuthor name={story.authorName} year={story.year} />
          </p>
          <Link href={href} className={`${styles.cta} press`}>
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Pointer tilt on desktop; gyro only when the reader opted in (Profile → «Живая обложка»).
 * Writes --tx/--ty (−1…1) straight to the band, no re-renders.
 */
function useTilt(ref: RefObject<HTMLElement | null>, motion: boolean) {
  useEffect(() => {
    const node = ref.current;
    if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let y = 0;
    let raf = 0;
    let base: number | null = null;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const write = () => {
      raf = 0;
      node.style.setProperty("--tx", x.toFixed(3));
      node.style.setProperty("--ty", y.toFixed(3));
    };
    const queue = () => {
      raf ||= requestAnimationFrame(write);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = node.getBoundingClientRect();
      x = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
      y = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
      queue();
    };
    const onLeave = () => {
      x = y = 0;
      queue();
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      base ??= e.beta; // calibrate to how this person holds the phone
      x += (clamp(e.gamma / 20) - x) * 0.15; // low-pass: sensors jitter
      y += (clamp((e.beta - base) / 20) - y) * 0.15;
      queue();
    };
    const pointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const gyro = motion && "DeviceOrientationEvent" in window;
    if (pointer) {
      node.addEventListener("pointermove", onMove, { passive: true });
      node.addEventListener("pointerleave", onLeave);
    }
    if (gyro) addEventListener("deviceorientation", onOrient);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      removeEventListener("deviceorientation", onOrient);
      cancelAnimationFrame(raf);
      node.style.removeProperty("--tx");
      node.style.removeProperty("--ty");
    };
  }, [ref, motion]);
}
