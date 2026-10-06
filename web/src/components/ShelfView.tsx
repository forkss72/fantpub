"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Spine } from "./Spine";
import { Pabchik } from "./Pabchik";
import { InstallHint } from "./InstallHint";
import { SettingsSheet } from "./reader/SettingsSheet";
import { exportKey, importKey, resetShelf, useHydrated, useShelf } from "@/lib/shelf";
import { REACTIONS } from "@/lib/reactions";
import { plural } from "@/lib/date";
import { SITE_URL } from "@/lib/site";
import type { StoryCard } from "@/lib/types";
import styles from "./ShelfView.module.css";

const WEEK = 7 * 24 * 60 * 60 * 1000;

export function ShelfView({ cards }: { cards: StoryCard[] }) {
  const shelf = useShelf();
  const hydrated = useHydrated();
  const [settings, setSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client clock + URL hash are post-mount facts
    setNow(Date.now());
    const m = location.hash.match(/key=([A-Za-z0-9_-]+)/);
    if (m) setPendingKey(m[1]);
  }, []);

  if (!hydrated) {
    return <div className={styles.skeleton} aria-busy="true" />;
  }

  const read = cards.filter((c) => shelf.read[c.slug]).sort((a, b) => shelf.read[a.slug] - shelf.read[b.slug]);
  const minutes = read.reduce((n, c) => n + c.minutes, 0);
  const thisWeek = read.filter((c) => now - shelf.read[c.slug] < WEEK).length;
  const guesses = Object.values(shelf.guesses);
  const guessedRight = guesses.filter(Boolean).length;
  const reactionCounts = REACTIONS.map((r) => ({ ...r, n: Object.values(shelf.reactions).filter((x) => x === r.key).length })).filter((r) => r.n > 0);
  const rows: StoryCard[][] = [];
  for (let i = 0; i < read.length; i += 8) rows.push(read.slice(i, i + 8));

  async function copyKey() {
    const link = `${SITE_URL}/polka#key=${exportKey()}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ключ от моей полки FantPub", url: link });
        return;
      }
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {}
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={`display ${styles.title}`}>Ваша полка</h1>
        <p className={styles.lead}>Всё хранится в этом браузере. Без регистрации, ничего не сгорает.</p>
      </header>

      {pendingKey && (
        <div className={styles.import} role="alertdialog" aria-labelledby="import-title">
          <p id="import-title" className={styles.importTitle}>
            Перенести полку с другого устройства?
          </p>
          <p className={styles.importText}>Прочитанное и реакции добавятся к тому, что уже есть здесь.</p>
          <div className={styles.row}>
            <button
              type="button"
              className="pill pill--sage"
              onClick={() => {
                importKey(pendingKey);
                setPendingKey(null);
                history.replaceState(null, "", "/polka");
              }}
            >
              Перенести
            </button>
            <button
              type="button"
              className="pill pill--ghost"
              onClick={() => {
                setPendingKey(null);
                history.replaceState(null, "", "/polka");
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <dl className={styles.stats}>
        <div>
          <dt>{plural(read.length, ["рассказ", "рассказа", "рассказов"])}</dt>
          <dd>{read.length}</dd>
        </div>
        <div>
          <dt>{plural(minutes, ["минута", "минуты", "минут"])} чтения</dt>
          <dd>{minutes}</dd>
        </div>
        <div>
          <dt>за эту неделю</dt>
          <dd>{thisWeek}</dd>
        </div>
      </dl>

      {read.length === 0 ? (
        <div className={styles.empty}>
          <Pabchik pose="sleeping" size={150} />
          <p>Полка пока пустая. Первая книга встанет сюда, когда вы дочитаете рассказ до слова «Конец».</p>
          <Link href="/" className="pill">
            К рассказу дня
          </Link>
        </div>
      ) : (
        <section className={styles.shelves} aria-label="Прочитанные рассказы">
          {rows.map((row, i) => (
            <div key={i} className={styles.shelf}>
              <ul className={styles.books}>
                {row.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/rasskaz/${c.slug}` as Route} title={`${c.title} — ${c.authorName}`} className={styles.book} prefetch={false}>
                      <Spine title={c.title} issue={c.issue} cloth={c.cloth} minutes={c.minutes} state="read" />
                      <span className="sr-only">
                        {c.title}, {c.authorName}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className={styles.ledge} aria-hidden="true" />
            </div>
          ))}
        </section>
      )}

      {(reactionCounts.length > 0 || guesses.length > 0) && (
        <section className={styles.card}>
          <h2 className={styles.h}>Ваш читательский почерк</h2>
          <ul className={styles.facts}>
            {guesses.length > 0 && (
              <li>
                Угадали автора <strong>{guessedRight}</strong> из {guesses.length}
                {guessedRight === guesses.length && guesses.length >= 3 ? " — Пабчик снимает шляпу (которой у него нет)." : "."}
              </li>
            )}
            {reactionCounts.map((r) => (
              <li key={r.key}>
                «{r.label}» — <strong>{r.n}</strong> {plural(r.n, ["раз", "раза", "раз"])}
              </li>
            ))}
          </ul>
        </section>
      )}

      {read.length >= 3 && <InstallHint />}

      <section className={styles.card}>
        <h2 className={styles.h}>Настройки</h2>
        <div className={styles.settingsRow}>
          <span className={styles.settingsNow}>
            {shelf.prefs.theme === "auto" ? "Тема по системе" : shelf.prefs.theme === "paper" ? "Бумага" : shelf.prefs.theme === "dusk" ? "Сумерки" : "Ночь"} ·{" "}
            {shelf.prefs.font === "literata" ? "Книжный шрифт" : shelf.prefs.font === "classic" ? "Классика" : "Без засечек"} · размер {shelf.prefs.size} ·{" "}
            {shelf.prefs.blind ? "слепое чтение" : "автор виден"}
          </span>
          <button type="button" className="pill pill--ghost" onClick={() => setSettings(true)}>
            Изменить
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h}>Ключ от полки</h2>
        <p className={styles.text}>
          Откройте эту ссылку на другом телефоне или ноутбуке — полка переедет вместе с реакциями. Аккаунт не нужен.
        </p>
        <div className={styles.row}>
          <button type="button" className="pill" onClick={copyKey} disabled={read.length === 0}>
            {copied ? "Ссылка скопирована" : "Скопировать ключ"}
          </button>
        </div>
      </section>

      {read.length > 0 && (
        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            if (confirm("Очистить полку? Прочитанное и реакции на этом устройстве исчезнут.")) resetShelf();
          }}
        >
          Очистить полку
        </button>
      )}

      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
