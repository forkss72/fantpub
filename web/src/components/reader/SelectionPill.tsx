"use client";

import { useEffect, useState } from "react";
import { showHud } from "@/components/ui/Hud";
import { addQuote } from "@/lib/shelf";
import { SITE_URL } from "@/lib/site";
import styles from "./SelectionPill.module.css";

type Sel = { text: string; x: number; y: number; below: boolean };

/**
 * Select a phrase in the story → a small glass pill: save it to «Цитаты» or share it as a card.
 * On touch screens the pill sits under the selection, clear of the system callout.
 */
export function SelectionPill({ slug, title }: { slug: string; title: string }) {
  const [sel, setSel] = useState<Sel | null>(null);
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
        if (text.length < 8 || text.length > 260) return setSel(null);
        const r = range.getBoundingClientRect();
        const below = matchMedia("(pointer: coarse)").matches;
        setSel({ text, x: r.left + r.width / 2, y: (below ? r.bottom + 14 : r.top - 12) + window.scrollY, below });
      }, 200);
    };
    document.addEventListener("selectionchange", onChange);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("selectionchange", onChange);
    };
  }, []);

  if (!sel) return null;

  const done = () => {
    setSel(null);
    document.getSelection()?.removeAllRanges();
  };

  const save = () => {
    addQuote(slug, sel.text);
    showHud("Цитата сохранена", "quote");
    done();
  };

  // the card route checks that the quote really is in the story
  const share = async () => {
    const url = `/rasskaz/${slug}/karta?q=${encodeURIComponent(sel.text)}`;
    setBusy(true);
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `fantpub-${slug}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `«${title}»`, text: `«${sel.text}» — «${title}», FantPub ${SITE_URL}/rasskaz/${slug}` });
      } else {
        window.open(url, "_blank", "noopener");
      }
    } catch (e) {
      if ((e as DOMException)?.name !== "AbortError") window.open(url, "_blank", "noopener");
    } finally {
      setBusy(false);
      done();
    }
  };

  const half = 112;
  const left = Math.min(Math.max(sel.x, half + 8), window.innerWidth - half - 8);

  return (
    <div className={styles.anchor} data-below={sel.below ? "" : undefined} style={{ left, top: sel.y }}>
      <div className={`${styles.pill} glass`} role="toolbar" aria-label="Выделенный текст" onPointerDown={(e) => e.preventDefault()}>
        <button type="button" className={styles.btn} onClick={save}>
          Сохранить цитату
        </button>
        <span className={styles.sep} aria-hidden="true" />
        <button type="button" className={styles.btn} onClick={share} disabled={busy}>
          {busy ? "Готовлю…" : "Поделиться"}
        </button>
      </div>
    </div>
  );
}
