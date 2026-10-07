import { getPublishedStories, getStory } from "@/lib/content";
import { BookDetail } from "@/components/book/BookDetail";
import { HardNavigate } from "@/components/book/HardNavigate";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return getPublishedStories().map((s) => ({ slug: s.slug }));
}

/** Soft navigation to /kniga/[slug]: the book page as a sheet over the current screen. */
export default async function BookSheet({ params }: PageProps<"/kniga/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  // tomorrow's issue (or a typo): no sheet, the full page answers with its 404
  if (!story) return <HardNavigate href={`/kniga/${encodeURIComponent(slug)}`} />;
  return <BookDetail story={story} variant="sheet" />;
}
