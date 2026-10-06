import { humanDate } from "@/lib/date";
import type { Story } from "@/lib/types";
import styles from "./Colophon.module.css";

const LANGS: Record<string, string> = { en: "английский", fr: "французский", de: "немецкий", ru: "русский", it: "итальянский", es: "испанский", pl: "польский" };

/** «Выходные данные» — who, when, from what, and why it is free to read. */
export function Colophon({ story }: { story: Story }) {
  const isOriginal = story.translation === "original";
  return (
    <section className={styles.colophon} aria-labelledby="colophon">
      <h2 id="colophon" className={`mono ${styles.h}`}>
        Выходные данные
      </h2>
      <dl className={styles.list}>
        <div>
          <dt>Выпуск</dt>
          <dd>
            № {story.issue}, {humanDate(story.date)} {story.date.slice(0, 4)}
          </dd>
        </div>
        <div>
          <dt>Автор</dt>
          <dd>
            <span className="fp-author-real">
              {story.author.name}, {story.author.born}–{story.author.died}
            </span>
            <span className="fp-author-sealed">под печатью до финала</span>
          </dd>
        </div>
        {story.originalTitle && !isOriginal && (
          <div>
            <dt>Оригинал</dt>
            <dd>
              <span className="fp-author-real">
                «{story.originalTitle}», {story.year}, {LANGS[story.originalLang] ?? story.originalLang}
              </span>
              <span className="fp-author-sealed">откроется вместе с автором</span>
            </dd>
          </div>
        )}
        <div>
          <dt>{isOriginal ? "Текст" : "Перевод"}</dt>
          <dd>
            {isOriginal
              ? `по изданию в общественном достоянии`
              : story.translation === "fantpub"
                ? "новый перевод FantPub, 2026"
                : story.translation}
          </dd>
        </div>
        {story.sourceUrl && (
          <div>
            <dt>Источник</dt>
            <dd>
              <a href={story.sourceUrl} rel="noopener nofollow" target="_blank">
                {story.sourceLabel ?? "оригинал"}
              </a>
            </dd>
          </div>
        )}
        <div>
          <dt>Права</dt>
          <dd>
            Общественное достояние: автор умер{" "}
            <span className="fp-author-real">в {story.author.died} году</span>
            <span className="fp-author-sealed">больше 70 лет назад</span>
            <span className="fp-author-real">, прошло больше 70 лет</span>.
            {story.translation === "fantpub" && " Перевод можно цитировать со ссылкой на FantPub."}
          </dd>
        </div>
      </dl>
    </section>
  );
}
