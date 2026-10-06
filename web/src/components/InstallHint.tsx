"use client";

import { useEffect, useState } from "react";
import { updateShelf, useShelf } from "@/lib/shelf";
import styles from "./InstallHint.module.css";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: BIPEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BIPEvent;
  });
}

/** Offered only after the reader is hooked (3+ stories). Dismiss once — never nag. */
export function InstallHint() {
  const shelf = useShelf();
  const [platform, setPlatform] = useState<"ios" | "prompt" | "other" | null>(null);

  useEffect(() => {
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (standalone) return setPlatform(null);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setPlatform(ios ? "ios" : deferred ? "prompt" : "other");
  }, []);

  if (!platform || platform === "other" || shelf.installHintDismissed) return null;
  const dismiss = () => updateShelf((s) => ({ ...s, installHintDismissed: true }));

  return (
    <div className={styles.hint}>
      <p className={styles.title}>Рассказ дня — одним касанием</p>
      {platform === "ios" ? (
        <p className={styles.text}>
          Нажмите <span className={styles.icon} aria-label="Поделиться">⎋</span> «Поделиться», затем «На экран „Домой“». FantPub откроется как приложение, без адресной строки.
        </p>
      ) : (
        <p className={styles.text}>Поставьте FantPub на главный экран — откроется как приложение и будет работать без лишних вкладок.</p>
      )}
      <div className={styles.row}>
        {platform === "prompt" && (
          <button
            type="button"
            className="pill pill--sage"
            onClick={async () => {
              await deferred?.prompt();
              deferred = null;
              dismiss();
            }}
          >
            Установить
          </button>
        )}
        <button type="button" className={styles.later} onClick={dismiss}>
          Не сейчас
        </button>
      </div>
    </div>
  );
}
