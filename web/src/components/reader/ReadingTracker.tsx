"use client";

import { useEffect, useRef, useState } from "react";
import { getShelf, saveProgress } from "@/lib/shelf";
import styles from "./ReadingTracker.module.css";

/** Remembers the paragraph you stopped at and offers to jump back. */
export function ReadingTracker({ slug, paragraphs, minutes }: { slug: string; paragraphs: number; minutes: number }) {
  const [resume, setResume] = useState<number | null>(null);
  const lastSaved = useRef(-1);

  useEffect(() => {
    const s = getShelf();
    const at = s.progress[slug] ?? 0;
    const atTop = window.scrollY < 200 && !location.hash;
    if (at > 2 && !s.read[slug] && atTop) setResume(at);

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-story-text] p[data-i]"));
    let current = at;
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (!Number.isNaN(i)) current = i;
          }
        }
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (current !== lastSaved.current) {
            lastSaved.current = current;
            saveProgress(slug, current);
          }
        }, 1200);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [slug]);

  if (resume === null) return null;

  const leftMin = Math.max(1, Math.round(minutes * (1 - resume / Math.max(1, paragraphs))));
  const jump = () => {
    const el = document.getElementById(`p${resume}`);
    if (el) {
      el.dataset.resume = "1";
      const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
      window.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      window.setTimeout(() => delete el.dataset.resume, 4000);
    }
    setResume(null);
  };

  return (
    <div className={styles.toast} role="status">
      <span>
        Вы остановились на середине. Осталось ~{leftMin} мин.
      </span>
      <div className={styles.actions}>
        <button type="button" className="pill pill--sage" onClick={jump}>
          Продолжить
        </button>
        <button type="button" className={styles.dismiss} onClick={() => setResume(null)}>
          С начала
        </button>
      </div>
    </div>
  );
}
