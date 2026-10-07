import type { Story, StoryCard, StoryMeta } from "./types";

export function toCard(s: Story | StoryMeta): StoryCard {
  return {
    slug: s.slug,
    issue: s.issue,
    date: s.date,
    title: s.title,
    genres: s.genres,
    mood: s.mood,
    minutes: s.minutes,
    motif: s.motif,
    cloth: s.cloth,
    year: s.year,
    age: s.age,
    hook: s.hook,
    cover: s.cover,
    authorName: s.author.name,
    authorSlug: s.author.slug,
  };
}

export function minutesLabel(m: number): string {
  return `${m} мин`;
}
