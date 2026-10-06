"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SettingsSheet } from "./SettingsSheet";
import styles from "./ReaderBar.module.css";

/** Floating vellum toolbar: back, title (after the header scrolls away), time left, «Aa». */
export function ReaderBar({ title, minutes }: { title: string; minutes: number }) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [left, setLeft] = useState(minutes);
  const [open, setOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const text = document.querySelector<HTMLElement>("[data-story-text]");
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) > 6) {
        setHidden(dy > 0 && y > 240);
        lastY = y;
      }
      setShowTitle(y > 260);
      if (text) {
        const top = text.offsetTop;
        const h = text.offsetHeight;
        const p = Math.min(1, Math.max(0, (y + window.innerHeight * 0.35 - top) / h));
        progressRef.current?.style.setProperty("--p", p.toFixed(4));
        setLeft(Math.max(0, Math.ceil(minutes * (1 - p))));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [minutes]);

  function back() {
    if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <>
      <div className={styles.progress} ref={progressRef} aria-hidden="true">
        <span />
      </div>
      <div className={styles.bar} data-hidden={hidden && !open}>
        <button type="button" className={styles.icon} onClick={back} aria-label="Назад">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.5 5.5L8 12l6.5 6.5" />
          </svg>
        </button>
        <span className={styles.title} data-visible={showTitle}>
          {title}
        </span>
        <span className={styles.left} aria-live="off">
          {left > 0 ? `ещё ${left} мин` : "финал"}
        </span>
        <button type="button" className={styles.aa} onClick={() => setOpen(true)} aria-label="Настройки чтения" aria-haspopup="dialog">
          Aa
        </button>
      </div>
      <SettingsSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
