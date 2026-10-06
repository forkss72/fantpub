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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- saved position lives in localStorage
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

  return resume === null ? null : <ResumeToast resume={resume} paragraphs={paragraphs} minutes={minutes} onDone={() => setResume(null)} />;
}

function ResumeToast({ resume, paragraphs, minutes, onDone }: { resume: number; paragraphs: number; minutes: number; onDone: () => void }) {
  // goes away by itself once the reader starts scrolling or after 12 s
  useEffect(() => {
    const y0 = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - y0) > 400) onDone();
    };
    const t = window.setTimeout(onDone, 12000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onDone]);

  const pct = Math.min(95, Math.max(5, Math.round((resume / Math.max(1, paragraphs)) * 100)));
  const leftMin = Math.max(1, Math.round(minutes * (1 - resume / Math.max(1, paragraphs))));
  const jump = () => {
    const el = document.getElementById(`p${resume}`);
    if (el) {
      el.dataset.resume = "1";
      const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
      window.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      window.setTimeout(() => delete el.dataset.resume, 4000);
    }
    onDone();
  };

  return (
    <div className={styles.toast} role="status">
      <span>
        Вы прочитали около {pct}%. Осталось ~{leftMin} мин.
      </span>
      <div className={styles.actions}>
        <button type="button" className="pill pill--sage" onClick={jump}>
          Продолжить
        </button>
        <button type="button" className={styles.dismiss} onClick={onDone}>
          С начала
        </button>
      </div>
    </div>
  );
}
