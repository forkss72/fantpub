import type { Author, StoryCard, StoryMeta } from "@/lib/types";
import type { TomorrowTeaser } from "@/lib/content";

/**
 * Contract between the reader (`app/rasskaz/[slug]/page.tsx`) and the finish
 * sequence (`components/finish/Finish.tsx`). The reader renders
 * `<Finish {...props} />` right after the «Конец» mark, inside
 * `<main data-reader-page data-seal={slug}>`, so `.blind-only` / `.reveal-only`
 * and `SealedAuthor` work without an extra wrapper.
 *
 * Who marks the story read: when «Конец» scrolls into view the reader calls
 * `markRead(slug)` only if blind reading is OFF. With blind reading ON,
 * marking read lifts the seal (BlindStyle unseals read slugs), so the reader
 * leaves it to Finish: guess answered or «Показать» → `markRead(slug)`.
 */
export type FinishProps = {
  /** The story just read, without its text. Client-safe. */
  story: StoryMeta;
  /**
   * Two distractors for «Кто это написал?», picked on the server:
   * deterministic per slug, nearest birth year first. The real author is
   * `story.author`; Finish decides the order of the three buttons
   * (keep it deterministic, e.g. by `story.issue`, to avoid hydration drift).
   */
  authors: Author[];
  /**
   * Teaser of the next issue + the moment it opens (epoch ms, for `<Countdown target>`).
   * Only for today's issue and only while tomorrow is still closed; otherwise null.
   */
  tomorrow: (TomorrowTeaser & { opensAt: number }) | null;
  /**
   * Candidates for the «Дальше» shelf, best first (same mood, then the rest,
   * newest first), current story excluded. Up to 8: Finish drops the ones the
   * reader has already read (client state) and shows 2.
   */
  next: StoryCard[];
};
