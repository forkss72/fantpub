"use client";

import { useEffect, useId, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { X } from "./icons";
import styles from "./Sheet.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** visually hidden title (for sheets whose content carries its own heading) */
  hideTitle?: boolean;
  /** trailing header slot (e.g. "Готово") */
  trailing?: ReactNode;
  /** "large" = almost full height; default sizes to content */
  detent?: "auto" | "large";
  /** full-bleed colour behind the content (book sheet) */
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
};

const CLOSE_MS = 260;

/**
 * Inset Liquid Glass sheet on a native <dialog>: focus trap, Esc and backdrop close for free.
 * Drag the grabber (or the header) down to dismiss.
 */
export function Sheet({ open, onClose, title, hideTitle, trailing, detent = "auto", style, className, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      delete d.dataset.closing;
      d.style.translate = "";
      d.showModal();
    } else if (!open && d.open) {
      d.dataset.closing = "";
      const t = setTimeout(() => d.close(), CLOSE_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      closeRef.current();
    };
    // backdrop click (closedby="any" does this natively in newer browsers; keep state in sync)
    const onClick = (e: MouseEvent) => {
      if (e.target === d) closeRef.current();
    };
    d.addEventListener("cancel", onCancel);
    d.addEventListener("click", onClick);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("click", onClick);
    };
  }, []);

  // drag down to dismiss
  const drag = useRef<{ y: number; t: number; dy: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    drag.current = { y: e.clientY, t: performance.now(), dy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    const s = drag.current;
    const d = ref.current;
    if (!s || !d) return;
    s.dy = Math.max(0, e.clientY - s.y);
    d.style.transition = "none";
    d.style.translate = `0 ${s.dy}px`;
  };
  const onPointerUp = () => {
    const s = drag.current;
    const d = ref.current;
    drag.current = null;
    if (!s || !d) return;
    d.style.transition = "";
    const v = s.dy / Math.max(1, performance.now() - s.t);
    if (s.dy > 110 || v > 0.6) closeRef.current();
    else d.style.translate = "";
  };

  return (
    <dialog
      ref={ref}
      className={[styles.sheet, "glass-strong", className].filter(Boolean).join(" ")}
      data-detent={detent}
      aria-labelledby={title ? titleId : undefined}
      style={style}
      closedby="any"
    >
      <div className={styles.head} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <span className={styles.grabber} aria-hidden="true" />
        <button type="button" className={`${styles.close} press`} onClick={onClose} aria-label="Закрыть">
          <X size={18} weight="bold" aria-hidden="true" />
        </button>
        {title && (
          <h2 id={titleId} className={hideTitle ? "sr-only" : styles.title}>
            {title}
          </h2>
        )}
        <div className={styles.trailing}>{trailing}</div>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
