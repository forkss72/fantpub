"use client";

import { useEffect, useState } from "react";
import styles from "./QuoteShare.module.css";

/** Select a line in the story → «Поделиться цитатой» → a 1080×1350 card with that quote. */
export function QuoteShare({ slug, title }: { slug: string; title: string }) {
  const [sel, setSel] = useState<{ text: string; x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const root = document.querySelector("[data-story-text]");
    if (!root) return;
    let t = 0;
    const onChange = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const s = document.getSelection();
        if (!s || s.isCollapsed || !s.rangeCount) return setSel(null);
        const range = s.getRangeAt(0);
        if (!root.contains(range.commonAncestorContainer)) return setSel(null);
        const text = s.toString().replace(/\s+/g, " ").trim();
        if (text.length < 12 || text.length > 260) return setSel(null);
        const r = range.getBoundingClientRect();
        setSel({ text, x: r.left + r.width / 2, y: r.bottom + window.scrollY });
      }, 220);
    };
    document.addEventListener("selectionchange", onChange);
    return () => document.removeEventListener("selectionchange", onChange);
  }, []);

  if (!sel) return null;

  async function share() {
    if (!sel) return;
    setBusy(true);
    const url = `/rasskaz/${slug}/karta?q=${encodeURIComponent(sel.text)}`;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], `fantpub-${slug}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `«${title}»`, text: `«${sel.text}» — FantPub` });
      } else {
        window.open(url, "_blank", "noopener");
      }
    } catch {
      window.open(url, "_blank", "noopener");
    } finally {
      setBusy(false);
      setSel(null);
      document.getSelection()?.removeAllRanges();
    }
  }

  return (
    <button
      type="button"
      className={styles.btn}
      style={{ left: Math.min(Math.max(sel.x, 110), window.innerWidth - 110), top: sel.y + 12 }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={share}
      disabled={busy}
    >
      {busy ? "Готовлю карточку…" : "Поделиться цитатой"}
    </button>
  );
}
