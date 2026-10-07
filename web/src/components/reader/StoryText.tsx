import type { ReactNode } from "react";
import type { Block } from "@/lib/types";
import styles from "./StoryText.module.css";

/** Inline markdown-light: *italic*, **bold**. Text is ours (trusted content files). */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    out.push(tok.startsWith("**") ? <strong key={k++}>{tok.slice(2, -2)}</strong> : <em key={k++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * The story itself: server-rendered, readable without JS, indexable.
 * Paragraphs carry `id="p{n}"` and `data-i` for progress, resume and read-aloud.
 */
export function StoryText({ blocks }: { blocks: Block[] }) {
  let n = 0;
  return (
    <div className={styles.text} data-story-text>
      {blocks.map((b, i) => {
        if (b.type === "break") {
          return (
            <p key={i} className={styles.break} aria-hidden="true">
              ⁂
            </p>
          );
        }
        if (b.type === "heading") {
          return (
            <h2 key={i} className={styles.heading}>
              {b.text}
            </h2>
          );
        }
        if (b.type === "epigraph") {
          // «строка / строка — Подпись»: verse lines and the signature on their own lines
          const [verse, sign] = b.text.split(/\s+—\s+(?=[^—]+$)/);
          return (
            <blockquote key={i} className={styles.epigraph}>
              {verse.split(/\s+\/\s+/).map((l, j) => (
                <span key={j} className={styles.verse}>
                  {inline(l)}
                </span>
              ))}
              {sign && <span className={styles.sign}>— {sign}</span>}
            </blockquote>
          );
        }
        const idx = n++;
        return (
          <p key={i} id={`p${idx}`} data-i={idx}>
            {inline(b.text)}
          </p>
        );
      })}
    </div>
  );
}
