import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { currentIssue, issueDate } from "./date";
import type { Author, Block, Cover, Story, StoryMeta } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const STORIES_DIR = path.join(CONTENT_DIR, "stories");

let storiesCache: Story[] | null = null;
let authorsCache: Record<string, Author> | null = null;
let coversCache: Record<string, Cover> | null = null;

const CACHE = process.env.NODE_ENV === "production";

export function getAuthors(): Record<string, Author> {
  if (authorsCache && CACHE) return authorsCache;
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "authors.json"), "utf8");
  authorsCache = JSON.parse(raw) as Record<string, Author>;
  return authorsCache;
}

export function getCovers(): Record<string, Cover> {
  if (coversCache && CACHE) return coversCache;
  coversCache = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "covers.json"), "utf8")) as Record<string, Cover>;
  return coversCache;
}

const NBSP = " ";
const SHORT_WORDS = /(?<=^|[\s(«„"])((?:[ВвИиКкСсОоУуАаЯя]|[Нн][аеио]|[Пп]о|[Зз]а|[Ии]з|[Оо]т|[Дд]о|[Нн]и|[Нн]е|[Оо]б|[Вв]о|[Сс]о|[Кк]о|[Тт]о|[Мм]ы|[Оо]н|[Вв]ы|[Тт]ы|[Ии]х|[Ее]ё|[Ее]го|[Бб]ез|[Пп]ро|[Пп]од|[Нн]ад|[Пп]ри|[Дд]ля|[Чч]то|[Кк]ак|[Нн]о|[Дд]а))[ \t]+/g;

/** Russian book typography: «ёлочки», em dashes, no orphaned prepositions. */
export function typograph(text: string): string {
  let t = text
    .replace(/(^|[\s(\[—-])"(?=\S)/g, "$1«")
    .replace(/"/g, "»")
    .replace(/(\S)[ \t]+[-–—][ \t]+/g, `$1${NBSP}— `)
    .replace(/^(—|–|-)\s+/g, `—${NBSP}`)
    .replace(/\.\.\./g, "…");
  // lookbehind keeps chains like «и в доме» intact
  t = t.replace(SHORT_WORDS, `$1${NBSP}`);
  // numbers stay with what they count: «1830 году», «12 апреля», «XX века»
  t = t.replace(/(\d|[IVXLC]{2,})[ \t]+(?=[А-Яа-яЁё])/g, `$1${NBSP}`);
  // particles stick to the previous word
  t = t.replace(/\s+(ли|же|бы|ж|б)(?=[\s.,!?…:;»)]|$)/g, `${NBSP}$1`);
  return t;
}

/** Splits markdown-light body into blocks: paragraphs, scene breaks, epigraphs. */
function parseBody(body: string): Block[] {
  const chunks = body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);
  const blocks: Block[] = [];
  for (const chunk of chunks) {
    if (/^(\*\s*){3}$|^⁂$|^\*\*\*$/.test(chunk)) {
      blocks.push({ type: "break" });
    } else if (chunk.startsWith("> ")) {
      blocks.push({ type: "epigraph", text: typograph(chunk.replace(/^>\s?/gm, "").replace(/\n/g, " ")) });
    } else if (/^#{1,3}\s/.test(chunk)) {
      blocks.push({ type: "heading", text: chunk.replace(/^#{1,3}\s/, "") });
    } else {
      blocks.push({ type: "p", text: typograph(chunk.replace(/\n/g, " ")) });
    }
  }
  return blocks;
}

function wordCount(blocks: Block[]): number {
  return blocks.reduce((n, b) => n + ("text" in b ? b.text.split(/\s+/).filter(Boolean).length : 0), 0);
}

function loadAll(): Story[] {
  if (storiesCache && CACHE) return storiesCache;
  const authors = getAuthors();
  const covers = getCovers();
  const files = fs.existsSync(STORIES_DIR) ? fs.readdirSync(STORIES_DIR).filter((f) => f.endsWith(".md")) : [];
  const stories = files.map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(STORIES_DIR, file), "utf8"));
    const blocks = parseBody(content);
    const words = wordCount(blocks);
    const author = authors[data.author];
    if (!author) throw new Error(`Unknown author "${data.author}" in ${file}`);
    const slug: string = data.slug ?? file.replace(/\.md$/, "");
    const cover = covers[slug];
    if (!cover) throw new Error(`No cover for "${slug}": run python3 tools/build-covers.py`);
    const story: Story = {
      slug,
      issue: Number(data.issue),
      date: issueDate(Number(data.issue)),
      title: data.title,
      author,
      originalTitle: data.original_title ?? null,
      originalLang: data.original_lang ?? "ru",
      year: Number(data.year),
      translation: data.translation ?? "original",
      sourceUrl: data.source_url ?? null,
      sourceLabel: data.source_label ?? null,
      genres: data.genres ?? [],
      mood: data.mood ?? "",
      age: data.age ?? "12+",
      words,
      minutes: Math.max(1, Math.round(words / 170)),
      teaser: typograph(data.teaser ?? ""),
      hook: typograph(data.hook ?? ""),
      note: typograph(data.note ?? ""),
      facts: (data.facts ?? []).map((f: string) => typograph(String(f))),
      quote: typograph(data.quote ?? ""),
      motif: data.motif ?? "star",
      cloth: data.cloth ?? "forest",
      ending: data.ending ?? null,
      cover,
      blocks,
    };
    return story;
  });
  stories.sort((a, b) => a.issue - b.issue);
  storiesCache = stories;
  return stories;
}

export function toMeta(s: Story): StoryMeta {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { blocks, ...meta } = s;
  return meta;
}

/** Every story, including unpublished — for build-time use only. */
export function getAllStories(): Story[] {
  return loadAll();
}

export function getPublishedStories(now = Date.now()): Story[] {
  const today = currentIssue(now);
  return loadAll().filter((s) => s.issue <= today);
}

export function getStory(slug: string, now = Date.now()): Story | null {
  const s = loadAll().find((x) => x.slug === slug);
  if (!s) return null;
  return s.issue <= currentIssue(now) ? s : null;
}

export function getTodayStory(now = Date.now()): Story | null {
  const published = getPublishedStories(now);
  return published.at(-1) ?? null;
}

/** Teaser of the next issue — genre and length only, never the title. */
export type TomorrowTeaser = {
  mood: string;
  minutes: number;
  genres: string[];
  issue: number;
  /** blurred art and colours only: the title stays closed until 00:00 MSK */
  cover: Pick<Cover, "placeholder" | "colors" | "srcSmall">;
};

export function getTomorrowTeaser(now = Date.now()): TomorrowTeaser | null {
  const next = loadAll().find((s) => s.issue === currentIssue(now) + 1);
  return next
    ? {
        mood: next.mood,
        minutes: next.minutes,
        genres: next.genres,
        issue: next.issue,
        // never tomorrow's real file: its name and the unblurred art would give the story away
        cover: { placeholder: next.cover.placeholder, colors: next.cover.colors, srcSmall: next.cover.placeholder },
      }
    : null;
}

export function getStoriesByAuthor(authorSlug: string, now = Date.now()): Story[] {
  return getPublishedStories(now).filter((s) => s.author.slug === authorSlug);
}
