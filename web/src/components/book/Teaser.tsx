"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BookDetail.module.css";

/** Three lines and Apple's «Ещё»; the button only appears when the text is actually cut. */
export function Teaser({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const check = () => setCut(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  return (
    <div className={styles.teaser}>
      <p ref={ref} className={styles.teaserText} data-open={open ? "" : undefined}>
        {text}
      </p>
      {cut && !open && (
        <button type="button" className={styles.more} onClick={() => setOpen(true)}>
          Ещё
        </button>
      )}
    </div>
  );
}
