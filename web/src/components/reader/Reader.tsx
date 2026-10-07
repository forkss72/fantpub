"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { GlassButton } from "@/components/ui/GlassButton";
import { PillMenu, type PillItem } from "@/components/ui/PillMenu";
import { showHud } from "@/components/ui/Hud";
import { ArrowUUpLeft, DotsThree, Export, Headphones, Pause, Play, Quotes, Stop, TextAa, X } from "@/components/ui/icons";
import { backOrHome } from "@/lib/nav";
import { getShelf, logReading, markOpened, markRead, saveProgress } from "@/lib/shelf";
import { shareOrCopy } from "@/lib/share";
import { SITE_URL } from "@/lib/site";
import { AppearanceSheet } from "./AppearanceSheet";
import { onReached } from "./reached";
import { currentParagraph, getSpeechStatus, pauseSpeech, resumeSpeech, speechSupported, startSpeech, stopSpeech, useSpeech } from "./speech";
import styles from "./Reader.module.css";

type Props = { slug: string; title: string; minutes: number; paragraphs: number };
type Toast = { kind: "resume"; at: number; pct: number } | { kind: "listen"; from: number } | null;

const noop = () => () => {};
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scrolls paragraph `i` to the upper third and washes it with ink for a moment. */
function jumpTo(i: number, flash = true) {
  const el = document.getElementById(`p${i}`);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3, behavior: reduced() ? "auto" : "smooth" });
  if (!flash) return;
  el.dataset.flash = "";
  window.setTimeout(() => (el.dataset.flash = "out"), 60);
  window.setTimeout(() => delete el.dataset.flash, 3200);
}

/**
 * Everything around the text, hidden while you read: ✕ · time left · Aa on top, the ••• pill menu and a
 * 2px progress line at the bottom. Tap the text (or scroll up, or reach either end) to bring it back.
 * Also: progress + resume, active reading time, read aloud, marking the story read at «Конец».
 */
export function Reader({ slug, title, minutes, paragraphs }: Props) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [left, setLeft] = useState(minutes);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const speech = useSpeech();
  const canSpeak = useSyncExternalStore(noop, speechSupported, () => false);

  // chrome: hide on scroll down, show on scroll up and near both ends; time left, progress line, saved place
  useEffect(() => {
    const text = document.querySelector<HTMLElement>("[data-story-text]");
    let lastY = window.scrollY;
    let p = 0;
    let raf = 0;
    let save = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (y < 80 || y > max - 80) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(y - lastY) > 12) {
        setHidden(y > lastY);
        lastY = y;
      }
      if (!text) return;
      const end = text.offsetTop + text.offsetHeight - window.innerHeight;
      p = Math.min(1, Math.max(0, end > 0 ? y / end : 1));
      bar.current?.style.setProperty("scale", `${p} 1`);
      setLeft(Math.ceil(minutes * (1 - p) - 0.05));
    };
    // only real scrolling moves the bookmark: opening the page must not reset it to the top
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
      window.clearTimeout(save);
      save = window.setTimeout(() => saveProgress(slug, currentParagraph(), Math.min(99, p * 100)), 800);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      window.clearTimeout(save);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [slug, minutes]);

  // tap on the page toggles the chrome (not when selecting, not on controls)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-reader-article]") && !t.matches("[data-reader-page]")) return;
      if (t.closest("a, button, input, label, summary, [role=button]")) return;
      if (!document.getSelection()?.isCollapsed) return;
      setHidden((h) => !h);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // first look at the shelf: resume where you stopped, or start listening for ?listen=1
  useEffect(() => {
    markOpened(slug);
    const s = getShelf();
    const at = s.read[slug] ? 0 : (s.progress[slug] ?? 0);
    const q = new URLSearchParams(location.search);
    if (q.get("listen") === "1") {
      q.delete("listen");
      history.replaceState(history.state, "", `${location.pathname}${q.size ? `?${q}` : ""}${location.hash}`);
      if (at > 0) jumpTo(at, false);
      const blocked = () => setToast({ kind: "listen", from: at });
      // a fresh page load has no user gesture yet: browsers refuse to speak, so offer a button
      if (!speechSupported()) return;
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) blocked();
      else if (!startSpeech(at, blocked)) showHud("Нет русского голоса", "check", "Чтение вслух недоступно");
      return;
    }
    if (at > 2 && window.scrollY < 200 && !location.hash) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved place lives in localStorage
      setToast({ kind: "resume", at, pct: Math.max(1, Math.min(99, s.percent[slug] || Math.round((at / paragraphs) * 100))) });
    }
  }, [slug, paragraphs]);

  // «Конец» scrolled into view and held there → read (a Tab jump to the finish doesn't count).
  // While the page is sealed, Finish marks it after the guess (marking lifts the seal).
  useEffect(() => {
    const el = document.querySelector("[data-end-mark]");
    if (!el) return;
    return onReached(
      el,
      () => {
        if (document.documentElement.dataset.blind !== "1") markRead(slug);
      },
      { threshold: 0.9 },
    );
  }, [slug]);

  // active reading time: visible tab + a scroll/tap in the last minute (or listening), flushed every 15 s
  useEffect(() => {
    let last = Date.now();
    let acc = 0;
    const poke = () => (last = Date.now());
    const flush = () => {
      if (acc > 0) logReading(acc);
      acc = 0;
    };
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible" && (Date.now() - last < 60_000 || getSpeechStatus() === "playing")) acc++;
      if (acc >= 15) flush();
    }, 1000);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const evs = ["scroll", "pointerdown", "keydown", "wheel"] as const;
    evs.forEach((e) => window.addEventListener(e, poke, { passive: true }));
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      window.clearInterval(id);
      flush();
      evs.forEach((e) => window.removeEventListener(e, poke));
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  // voices load lazily in Chrome; stop talking when leaving the story
  useEffect(() => {
    if (speechSupported()) speechSynthesis.getVoices();
    return stopSpeech;
  }, [slug]);

  function listen(from = currentParagraph()) {
    setToast(null);
    if (!startSpeech(from, () => setToast({ kind: "listen", from }))) showHud("Нет русского голоса", "check", "Чтение вслух недоступно");
  }

  // the stack grows up from •••: the first item sits next to the button, the dark one on top
  const items: PillItem[] = [
    { label: "В начало", icon: ArrowUUpLeft, onSelect: () => window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" }) },
    { label: "Поделиться ссылкой", icon: Export, onSelect: () => void shareOrCopy(`${SITE_URL}/rasskaz/${slug}`, `«${title}»`) },
    { label: "Поделиться цитатой", icon: Quotes, onSelect: () => showHud("Выделите фразу", "quote", "Появится кнопка «Поделиться»") },
    ...(canSpeak
      ? [speech === "idle" ? { label: "Слушать", icon: Headphones, onSelect: () => listen() } : { label: "Остановить чтение", icon: Stop, onSelect: stopSpeech }]
      : []),
    { label: "Оформление", icon: TextAa, primary: true, onSelect: () => setSheet(true) },
  ];

  const chromeHidden = hidden && !sheet ? "" : undefined;

  return (
    <>
      <div className={styles.top} data-hidden={chromeHidden}>
        <GlassButton icon={X} label="Закрыть" onClick={() => backOrHome(router)} />
        <p className={`${styles.left} num`}>{left > 0 ? `осталось ~${left} мин` : ""}</p>
        <GlassButton icon={TextAa} label="Оформление" aria-haspopup="dialog" onClick={() => setSheet(true)} />
      </div>

      <div className={styles.bottom} data-hidden={chromeHidden}>
        <PillMenu label="Меню чтения" placement="up-end" items={items} trigger={(p) => <GlassButton icon={DotsThree} label="Ещё" {...p} />} />
      </div>
      <span className={styles.progress} data-hidden={chromeHidden} aria-hidden="true">
        <span ref={bar} />
      </span>

      {speech !== "idle" ? (
        <div className={styles.dock}>
          <div className={`${styles.player} glass`} role="group" aria-label="Чтение вслух">
            <button
              type="button"
              className={styles.round}
              onClick={speech === "playing" ? pauseSpeech : resumeSpeech}
              aria-label={speech === "playing" ? "Пауза" : "Продолжить"}
            >
              {speech === "playing" ? <Pause size={22} weight="fill" aria-hidden="true" /> : <Play size={22} weight="fill" aria-hidden="true" />}
            </button>
            <span className={styles.now}>
              <span className={styles.nowTitle}>{title}</span>
              <span className={styles.nowSub} aria-live="polite">
                {speech === "playing" ? "Читаю вслух" : "Пауза"}
              </span>
            </span>
            <button type="button" className={styles.round} onClick={stopSpeech} aria-label="Остановить">
              <X size={18} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : toast ? (
        <ToastView toast={toast} onClose={() => setToast(null)} onListen={listen} />
      ) : null}

      <AppearanceSheet open={sheet} onClose={() => setSheet(false)} />
    </>
  );
}

function ToastView({ toast, onClose, onListen }: { toast: NonNullable<Toast>; onClose: () => void; onListen: (from: number) => void }) {
  // goes away by itself: after a while, or once the reader scrolls on
  useEffect(() => {
    const y0 = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - y0) > 400) onClose();
    };
    const t = window.setTimeout(onClose, 10_000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onClose]);

  return (
    <div className={styles.dock} role="status">
      <div className={`${styles.toast} glass`}>
        {toast.kind === "resume" ? (
          <button
            type="button"
            className={styles.toastMain}
            onClick={() => {
              jumpTo(toast.at);
              onClose();
            }}
          >
            <span>
              Продолжить с <span className="num">{toast.pct}%</span>
            </span>
          </button>
        ) : (
          <button type="button" className={styles.toastMain} onClick={() => onListen(toast.from)}>
            <Headphones size={20} aria-hidden="true" />
            Слушать
          </button>
        )}
        <button type="button" className={styles.round} onClick={onClose} aria-label="Скрыть">
          <X size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
