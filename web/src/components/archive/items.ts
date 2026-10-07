import type { Cover, StoryMeta } from "@/lib/types";

type BookCover = Pick<Cover, "src" | "srcSmall" | "placeholder" | "colors">;

/** What a cover tile, a list row or a search hit needs; small enough to ship to the client. */
export type ArchiveItem = {
  slug: string;
  issue: number;
  date: string;
  title: string;
  mood: string;
  minutes: number;
  /** year the story was written: shown next to the author once the seal lifts */
  year: number;
  authorName: string;
  cover: BookCover;
};

/** Tomorrow's issue: mood, length and a blurred cover, never the title. */
export type TomorrowItem = {
  issue: number;
  date: string;
  mood: string;
  minutes: number;
  opensAt: number;
  cover: BookCover;
};

export function toItem(s: StoryMeta): ArchiveItem {
  const { src, srcSmall, placeholder, colors } = s.cover;
  return {
    slug: s.slug,
    issue: s.issue,
    date: s.date,
    title: s.title,
    mood: s.mood,
    minutes: s.minutes,
    year: s.year,
    authorName: s.author.name,
    cover: { src, srcSmall, placeholder, colors },
  };
}

export const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Authors sort by surname, the way a library shelves them. */
export const surname = (name: string) => name.split(" ").at(-1) ?? name;
