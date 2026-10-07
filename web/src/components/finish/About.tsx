"use client";

import { useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { CaretRight } from "@/components/ui/icons";
import { humanDate } from "@/lib/date";
import type { StoryMeta } from "@/lib/types";
import s from "./Finish.module.css";

const LANGS: Record<string, string> = { en: "английский", fr: "французский", de: "немецкий", ru: "русский", it: "итальянский", es: "испанский", pl: "польский" };

/**
 * Author-revealing text. `masked` forces the mask (the guess is still open on this page);
 * otherwise the global seal CSS decides (needs the ancestor `data-seal`).
 */
function Sealed({ real, mask, masked }: { real: ReactNode; mask: string; masked: boolean }) {
  if (masked) return <>{mask}</>;
  return (
    <>
      <span className="seal-real">{real}</span>
      <span className="seal-mask">{mask}</span>
    </>
  );
}

function Row({ k, children, className }: { k: string; children: ReactNode; className?: string }) {
  return (
    <div className={className ? `${s.row} ${className}` : s.row}>
      <dt>{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** «Об издании»: a quiet row at the very end; the colophon lives in a sheet (still in the DOM for crawlers). */
export function About({ story, masked }: { story: StoryMeta; masked: boolean }) {
  const [open, setOpen] = useState(false);
  const { author, cover } = story;
  const isOriginal = story.translation === "original";
  const credit = cover.credit;
  return (
    <div className={s.about}>
      <button type="button" className={s.aboutRow} onClick={() => setOpen(true)} aria-haspopup="dialog">
        Об издании
        <CaretRight size={16} weight="bold" aria-hidden="true" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Об издании">
        <dl className={s.group}>
          <Row k="Выпуск">
            № {story.issue}, {humanDate(story.date)} {story.date.slice(0, 4)}
          </Row>
          <Row k="Автор">
            <Sealed
              masked={masked}
              mask="Скрыт до финала"
              real={
                <>
                  {author.name}, {author.born}–{author.died}
                </>
              }
            />
          </Row>
          {story.originalTitle && !isOriginal && (
            <Row k="Оригинал">
              <Sealed
                masked={masked}
                mask="Откроется вместе с автором"
                real={
                  <>
                    «{story.originalTitle}», {story.year}, {LANGS[story.originalLang] ?? story.originalLang}
                  </>
                }
              />
            </Row>
          )}
          <Row k={isOriginal ? "Текст" : "Перевод"}>
            {isOriginal ? "По изданию в общественном достоянии" : story.translation === "fantpub" ? "Новый перевод FantPub, 2026" : story.translation}
          </Row>
          {/* the source URL names the author (Wikisource): never while the guess is open, and only once unsealed */}
          {story.sourceUrl && !masked && (
            <Row k="Источник" className="reveal-only">
              <a href={story.sourceUrl} rel="noopener nofollow" target="_blank" className={s.link}>
                {story.sourceLabel ?? "Оригинал"}
              </a>
            </Row>
          )}
          <Row k="Права">
            Общественное достояние: автор умер <Sealed masked={masked} mask="больше 70 лет назад" real={`в ${author.died} году`} />.
            {story.translation === "fantpub" && " Перевод можно цитировать со ссылкой на FantPub."}
          </Row>
        </dl>

        <h3 className={s.groupHead}>Обложка</h3>
        <dl className={s.group}>
          <Row k="Картина">
            {credit.artist}, «{credit.title}», {credit.year}
          </Row>
          {credit.museum && <Row k="Собрание">{credit.museum}</Row>}
          <Row k="Лицензия">
            <a href={credit.licenseUrl} rel="noopener nofollow" target="_blank" className={s.link}>
              {credit.license}
            </a>
          </Row>
          {credit.pageUrl && (
            <Row k="Источник">
              <a href={credit.pageUrl} rel="noopener nofollow" target="_blank" className={s.link}>
                Страница работы
              </a>
            </Row>
          )}
        </dl>
      </Sheet>
    </div>
  );
}
