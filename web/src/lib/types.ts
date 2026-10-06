export type Author = {
  slug: string;
  name: string; // «Амброз Бирс»
  nameShort?: string; // «Бирс»
  born: number;
  died: number;
  country: string;
  bio: string; // 1–2 sentences, Pabchik's voice
};

export type Block =
  | { type: "p"; text: string }
  | { type: "epigraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "break" };

export type ClothKey =
  | "forest"
  | "oxblood"
  | "ink"
  | "teal"
  | "plum"
  | "ochre"
  | "terracotta"
  | "olive"
  | "slate"
  | "sage";

export type StoryMeta = {
  slug: string;
  issue: number;
  date: string; // ISO, Moscow calendar day
  title: string;
  author: Author;
  originalTitle: string | null;
  originalLang: string;
  year: number;
  /** "fantpub" = our new translation, "original" = written in Russian, otherwise translator credit */
  translation: string;
  sourceUrl: string | null;
  sourceLabel: string | null;
  genres: string[];
  mood: string;
  age: string;
  words: number;
  minutes: number;
  teaser: string;
  hook: string;
  note: string;
  facts: string[];
  quote: string;
  motif: string;
  cloth: ClothKey;
  ending: string | null;
};

export type Story = StoryMeta & { blocks: Block[] };

/** Small, client-safe card used on shelves, archive, home. */
export type StoryCard = Pick<
  StoryMeta,
  "slug" | "issue" | "date" | "title" | "genres" | "mood" | "minutes" | "motif" | "cloth" | "year" | "age"
> & { authorName: string; authorSlug: string };

export type ReactionKey = "wow" | "hooked" | "pondering" | "notmine";
