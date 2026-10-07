"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Book } from "@/components/ui/Book";
import { Segmented } from "@/components/ui/Segmented";
import { ThemeTiles } from "@/components/ui/ThemeTiles";
import { Eye, EyeSlash } from "@/components/ui/icons";
import { coverVars } from "@/lib/cover";
import { tick } from "@/lib/haptics";
import { completeOnboarding, setGoal, setPrefs, setProfile, updateShelf, useHydrated, useShelf } from "@/lib/shelf";
import type { Cover } from "@/lib/types";
import coversJson from "../../../content/covers.json";
import styles from "./Onboarding.module.css";

type FanBook = { slug: string; title: string; issue: number; cover: Pick<Cover, "src" | "srcSmall" | "placeholder" | "colors"> };

const COVERS = coversJson as unknown as Record<string, Cover>;
// ponytail: titles duplicated from content/stories; only issues 1–9 (long published), so the fan never shows a future cover
const FAN: [string, string, number][] = [
  ["zelenaya-lampa", "Зелёная лампа", 3],
  ["koshki-ultara", "Кошки Ультара", 7],
  ["robinzony", "Робинзоны", 5],
  ["odoevsky-bal", "Бал", 4],
  ["pered-zakonom", "Перед законом", 2],
  ["grobovshchik", "Гробовщик", 1],
  ["to-chego-ne-bylo", "То, чего не было", 8],
];
/** fan order: front, then alternating left/right */
const SLOTS = [0, -1, 1, -2, 2, -3, 3];
const STEPS = ["Один рассказ в день", "Автор — под стеклом", "Как вам удобнее читать", "Ваша цель"];
const MINUTES = ["5", "10", "15", "20"] as const;

/** Show the welcome layer again (Profile → «Как это работает»). */
export function replayOnboarding() {
  updateShelf((s) => ({ ...s, onboarded: false }));
}

/**
 * First-visit welcome on Today: four swipeable steps over a slowly drifting fan of real covers.
 * Renders nothing once the shelf is onboarded. `today` (optional) puts the book of the day in front.
 */
export function Onboarding({ today, initialStep = 0 }: { today?: FanBook; initialStep?: number }) {
  const { onboarded } = useShelf();
  const hydrated = useHydrated();
  if (!hydrated || onboarded) return null;
  return <Layer today={today} initialStep={initialStep} />;
}

function Layer({ today, initialStep }: { today?: FanBook; initialStep: number }) {
  const shelf = useShelf();
  const dialog = useRef<HTMLDialogElement>(null);
  const pager = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);
  const [peek, setPeek] = useState(false);
  const [minutes, setMinutes] = useState<string>(MINUTES.find((m) => m === String(shelf.goal.daily)) ?? "10");
  const [name, setName] = useState(shelf.profile.name);

  const books: FanBook[] = [
    ...(today ? [today] : []),
    ...FAN.filter(([slug]) => slug !== today?.slug && COVERS[slug]).map(([slug, title, issue]) => ({ slug, title, issue, cover: COVERS[slug] })),
  ].slice(0, SLOTS.length);
  const front = books[0];

  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finish = (save: boolean) => {
    if (done.current) return;
    done.current = true;
    if (save) {
      setGoal({ daily: Number(minutes) });
      setProfile({ name: name.trim().slice(0, 40) });
    }
    setClosing(true);
    window.setTimeout(completeOnboarding, reduced() ? 160 : 520);
  };
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  useEffect(() => {
    const d = dialog.current;
    const p = pager.current;
    if (!d || !p) return;
    if (!d.open) d.showModal();
    if (initialStep > 0) {
      p.scrollLeft = Math.min(initialStep, STEPS.length - 1) * p.clientWidth;
    }
    // focus the layer itself: no ring on «Далее» for touch users, Tab starts inside
    d.focus();
    // Esc = skip; a forced close (repeated Esc) still counts as seen
    const onCancel = (e: Event) => {
      e.preventDefault();
      finishRef.current(false);
    };
    const onClose = () => finishRef.current(false);
    d.addEventListener("cancel", onCancel);
    d.addEventListener("close", onClose);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("close", onClose);
    };
  }, [initialStep]);

  const go = (i: number) => {
    const p = pager.current;
    if (!p || i < 0 || i >= STEPS.length) return;
    tick();
    p.scrollTo({ left: i * p.clientWidth, behavior: reduced() ? "auto" : "smooth" });
  };

  const onScroll = () => {
    const p = pager.current;
    if (!p) return;
    const i = Math.round(p.scrollLeft / Math.max(1, p.clientWidth));
    if (i !== step) setStep(i);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, [role=radiogroup]")) return;
    e.preventDefault();
    go(step + (e.key === "ArrowRight" ? 1 : -1));
  };

  const last = step === STEPS.length - 1;
  const size = shelf.prefs.size;

  return (
    <dialog
      ref={dialog}
      className={styles.layer}
      style={coverVars(front.cover.colors)}
      aria-label="Добро пожаловать в FantPub"
      tabIndex={-1}
      data-closing={closing ? "" : undefined}
      onKeyDown={onKeyDown}
    >
      <div className={styles.fan} data-step={step} aria-hidden="true">
        {books.map((b, i) => (
          <div key={b.slug} className={styles.card} style={{ "--k": SLOTS[i], "--a": Math.abs(SLOTS[i]), "--i": i } as CSSProperties}>
            <div className={styles.float}>
              <Book cover={b.cover} title={b.title} issue={b.issue} width="var(--cw)" sizes="240px" depth={i === 0} priority={i < 3} />
            </div>
          </div>
        ))}
        <div className={styles.ledge} />
      </div>

      {!last && (
        <button type="button" className={styles.skip} onClick={() => finish(false)}>
          Пропустить
        </button>
      )}
      <div ref={pager} className={styles.pager} onScroll={onScroll}>
        <section className={styles.pane} inert={step !== 0} aria-labelledby="ob-0">
          <div className={styles.stage} />
          <div className={styles.content}>
            <h2 id="ob-0" className={styles.title}>
              {STEPS[0]}
            </h2>
            <p className={styles.body}>Каждый день в&nbsp;полночь открывается новый. Прошлые остаются на&nbsp;полке навсегда.</p>
            <figure className={styles.says}>
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny pre-sized webp */}
              <img src="/pabchik/avatar.webp" alt="" width={36} height={36} className={styles.avatar} decoding="async" />
              <blockquote className={styles.bubble}>
                <span className="sr-only">Пабчик: </span>Я&nbsp;Пабчик, домовой этой библиотеки. Буду рядом, но&nbsp;не&nbsp;мешать.
              </blockquote>
            </figure>
          </div>
        </section>

        <section className={styles.pane} inert={step !== 1} aria-labelledby="ob-1">
          <div className={styles.stage}>
            <button
              type="button"
              className={`${styles.chip} press`}
              data-peek={peek ? "" : undefined}
              aria-label={peek ? "Это вы узнаете в конце" : "Подсмотреть автора"}
              onClick={() => {
                tick();
                setPeek(!peek);
              }}
            >
              {peek ? <Eye size={16} weight="bold" aria-hidden="true" /> : <EyeSlash size={16} weight="bold" aria-hidden="true" />}
              <span className={styles.chipText} aria-hidden="true">
                <span className={styles.frost}>Это вы узнаете в конце</span>
                <span className={styles.clear}>Это вы узнаете в конце</span>
              </span>
            </button>
          </div>
          <div className={styles.content}>
            <h2 id="ob-1" className={styles.title}>
              {STEPS[1]}
            </h2>
            <p className={styles.body}>Имя откроется после последней строки&nbsp;— попробуйте угадать.</p>
            <label className={styles.row}>
              <span>Слепое чтение</span>
              <input
                type="checkbox"
                role="switch"
                className={styles.switch}
                checked={shelf.prefs.blind}
                onChange={(e) => setPrefs({ blind: e.target.checked })}
              />
            </label>
          </div>
        </section>

        <section className={styles.pane} inert={step !== 2} aria-labelledby="ob-2">
          <div className={`${styles.stage} ${styles.stageFill}`}>
            <div className={styles.page} aria-hidden="true">
              <p>
                В&nbsp;тот вечер в&nbsp;библиотеке было тихо. Лампа под зелёным абажуром освещала одну-единственную страницу, и&nbsp;страница эта ждала именно
                вас. Часы пробили полночь&nbsp;— и&nbsp;на&nbsp;полке появилась новая книга.
              </p>
              <p>
                Её не&nbsp;нужно было искать: она стояла на&nbsp;виду, в&nbsp;переплёте цвета вечернего неба, и&nbsp;терпеливо ждала, когда её&nbsp;откроют.
              </p>
            </div>
          </div>
          <div className={styles.content}>
            <h2 id="ob-2" className={styles.title}>
              {STEPS[2]}
            </h2>
            <div className={styles.size} role="group" aria-label="Размер текста">
              <button type="button" aria-label="Мельче" disabled={size <= 1} onClick={() => setPrefs({ size: size - 1 })}>
                <span className={styles.aSmall}>A</span>
              </button>
              <button type="button" aria-label="Крупнее" disabled={size >= 7} onClick={() => setPrefs({ size: size + 1 })}>
                <span className={styles.aBig}>A</span>
              </button>
            </div>
            <ThemeTiles />
          </div>
        </section>

        <section className={styles.pane} inert={step !== 3} aria-labelledby="ob-3">
          <div className={styles.stage} />
          <div className={styles.content}>
            <h2 id="ob-3" className={styles.title}>
              {STEPS[3]}
            </h2>
            <div className={styles.minutes}>
              <Segmented value={minutes} options={MINUTES.map((m) => ({ value: m, label: m }))} onChange={setMinutes} label="Минут чтения в день" />
              <p className={styles.caption}>минут чтения в&nbsp;день</p>
            </div>
            <input
              className={styles.field}
              type="text"
              name="name"
              autoComplete="given-name"
              enterKeyHint="done"
              maxLength={40}
              placeholder="Как вас называть?"
              aria-label="Как вас называть?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && finish(true)}
            />
          </div>
        </section>
      </div>

      <div className={styles.barWrap}>
        <div className={`${styles.bar} glass glass-tint`}>
          <div className={styles.dots}>
            {STEPS.map((t, i) => (
              <button key={t} type="button" className={styles.dot} aria-label={`Шаг ${i + 1}: ${t}`} aria-current={i === step ? "step" : undefined} onClick={() => go(i)}>
                <span />
              </button>
            ))}
          </div>
          <button type="button" className={`${styles.next} press`} onClick={() => (last ? finish(true) : go(step + 1))}>
            {last ? "Начать" : "Далее"}
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Шаг ${step + 1} из ${STEPS.length}. ${STEPS[step]}`}
      </p>
    </dialog>
  );
}
